-- Drop existing tables and policies
DROP TABLE IF EXISTS backup_logs;
DROP TABLE IF EXISTS backups;

-- Create backups table
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create backup_logs table
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('create', 'restore', 'error')),
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create single, simple policy for each table that allows all operations
CREATE POLICY "enable_all_for_authenticated_backups"
ON backups FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_for_authenticated_backup_logs"
ON backup_logs FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Grant all permissions to authenticated users
GRANT ALL ON backups TO authenticated;
GRANT ALL ON backup_logs TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);