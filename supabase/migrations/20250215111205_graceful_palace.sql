-- Drop existing tables if they exist
DROP TABLE IF EXISTS backup_logs;
DROP TABLE IF EXISTS backups;

-- Create backups table with proper structure
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create backup_logs table with proper structure
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('create', 'restore', 'error')),
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "backups_select_policy" ON backups;
DROP POLICY IF EXISTS "backups_insert_policy" ON backups;
DROP POLICY IF EXISTS "backups_delete_policy" ON backups;
DROP POLICY IF EXISTS "backup_logs_select_policy" ON backup_logs;
DROP POLICY IF EXISTS "backup_logs_insert_policy" ON backup_logs;

-- Create policies for backups with proper authentication checks
CREATE POLICY "backups_select_policy"
ON backups FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "backups_insert_policy"
ON backups FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "backups_delete_policy"
ON backups FOR DELETE TO authenticated
USING (auth.role() = 'authenticated');

-- Create policies for backup_logs with proper authentication checks
CREATE POLICY "backup_logs_select_policy"
ON backup_logs FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "backup_logs_insert_policy"
ON backup_logs FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Grant minimal required permissions
GRANT SELECT, INSERT, DELETE ON backups TO authenticated;
GRANT SELECT, INSERT ON backup_logs TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(type);