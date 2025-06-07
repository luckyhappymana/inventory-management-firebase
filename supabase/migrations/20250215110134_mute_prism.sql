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

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users on backups"
ON backups FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users on backups"
ON backups FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable read access for all users on backup_logs"
ON backup_logs FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users on backup_logs"
ON backup_logs FOR INSERT
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON backups TO authenticated, anon;
GRANT SELECT, INSERT ON backup_logs TO authenticated, anon;