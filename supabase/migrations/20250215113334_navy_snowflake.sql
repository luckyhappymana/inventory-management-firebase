-- Drop existing tables if they exist
DROP TABLE IF EXISTS backup_logs;
DROP TABLE IF EXISTS backups;

-- Create backups table with simplified structure
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create backup_logs table with simplified structure
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create maximally permissive policies
CREATE POLICY "enable_all_backups"
ON backups
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_backup_logs"
ON backup_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant all permissions to both anon and authenticated roles
GRANT ALL ON backups TO anon, authenticated;
GRANT ALL ON backup_logs TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);