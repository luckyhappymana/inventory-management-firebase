-- Drop existing tables if they exist
DROP TABLE IF EXISTS backup_logs;
DROP TABLE IF EXISTS backups;

-- Create backups table with proper structure
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_metadata CHECK (
    metadata ? 'id' AND
    metadata ? 'timestamp' AND
    metadata ? 'itemCount' AND
    metadata ? 'transactionCount' AND
    metadata ? 'withdrawalCount'
  )
);

-- Create backup_logs table with proper structure
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('create', 'restore', 'error')),
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function for managing backups with proper error handling
CREATE OR REPLACE FUNCTION manage_backup(
  p_operation TEXT,
  p_backup_id UUID DEFAULT NULL,
  p_data TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_error TEXT;
BEGIN
  -- Initialize result
  v_result := jsonb_build_object('success', false);
  
  BEGIN
    CASE p_operation
      WHEN 'create' THEN
        IF p_data IS NULL OR p_metadata IS NULL THEN
          RAISE EXCEPTION 'Missing required data for backup creation';
        END IF;
        
        INSERT INTO backups (data, metadata)
        VALUES (p_data, p_metadata)
        RETURNING jsonb_build_object(
          'success', true,
          'id', id,
          'created_at', created_at
        ) INTO v_result;
        
      WHEN 'restore' THEN
        IF p_backup_id IS NULL THEN
          RAISE EXCEPTION 'Backup ID is required for restoration';
        END IF;
        
        -- Verify backup exists
        IF NOT EXISTS (SELECT 1 FROM backups WHERE id = p_backup_id) THEN
          RAISE EXCEPTION 'Backup not found';
        END IF;
        
        -- Return backup data
        SELECT jsonb_build_object(
          'success', true,
          'data', data,
          'metadata', metadata
        )
        FROM backups
        WHERE id = p_backup_id
        INTO v_result;
        
      ELSE
        RAISE EXCEPTION 'Invalid operation: %', p_operation;
    END CASE;
    
  EXCEPTION
    WHEN OTHERS THEN
      v_error := SQLERRM;
      v_result := jsonb_build_object(
        'success', false,
        'error', v_error
      );
      
      -- Log error
      INSERT INTO backup_logs (type, metadata)
      VALUES ('error', jsonb_build_object(
        'operation', p_operation,
        'error', v_error,
        'backup_id', p_backup_id
      ));
  END;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for backups
CREATE POLICY "backups_select_policy"
ON backups FOR SELECT TO authenticated
USING (true);

CREATE POLICY "backups_insert_policy"
ON backups FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "backups_delete_policy"
ON backups FOR DELETE TO authenticated
USING (true);

-- Create policies for backup_logs
CREATE POLICY "backup_logs_select_policy"
ON backup_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "backup_logs_insert_policy"
ON backup_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON backups TO authenticated;
GRANT SELECT, INSERT ON backup_logs TO authenticated;
GRANT EXECUTE ON FUNCTION manage_backup TO authenticated;

-- Create indexes
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);