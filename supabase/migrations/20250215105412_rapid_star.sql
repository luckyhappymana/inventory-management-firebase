/*
  # Backup System Setup

  1. Tables
    - backups: Stores encrypted backup data and metadata
    - backup_logs: Tracks backup operations and errors

  2. Functions
    - manage_backup_restore: Handles backup restoration with transaction management
    
  3. Security
    - RLS policies for authenticated access
    - Permissions for authenticated users
*/

-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY,
  data TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create backup_logs table
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function for backup restoration with transaction management
CREATE OR REPLACE FUNCTION manage_backup_restore(
  p_operation TEXT,
  p_items JSONB DEFAULT NULL,
  p_transactions JSONB DEFAULT NULL,
  p_withdrawal_records JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  v_result := FALSE;
  
  IF p_operation = 'clear' THEN
    -- Clear existing data
    DELETE FROM withdrawal_records;
    DELETE FROM transactions;
    DELETE FROM items;
    v_result := TRUE;
  ELSIF p_operation = 'restore' THEN
    -- Restore data
    IF p_items IS NOT NULL THEN
      INSERT INTO items SELECT * FROM jsonb_populate_recordset(NULL::items, p_items);
    END IF;
    
    IF p_transactions IS NOT NULL THEN
      INSERT INTO transactions SELECT * FROM jsonb_populate_recordset(NULL::transactions, p_transactions);
    END IF;
    
    IF p_withdrawal_records IS NOT NULL THEN
      INSERT INTO withdrawal_records SELECT * FROM jsonb_populate_recordset(NULL::withdrawal_records, p_withdrawal_records);
    END IF;
    
    v_result := TRUE;
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Backup operation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for authenticated users on backups"
ON backups FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users on backup_logs"
ON backup_logs FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON backups TO authenticated;
GRANT ALL ON backup_logs TO authenticated;
GRANT EXECUTE ON FUNCTION manage_backup_restore TO authenticated;