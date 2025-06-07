-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(type);