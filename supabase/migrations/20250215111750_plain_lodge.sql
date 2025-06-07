/*
  # Backup System Fix

  1. Tables
    - backups: Stores encrypted backup data and metadata
    - backup_logs: Tracks backup operations and errors
  
  2. Security
    - Enable RLS
    - Create proper policies for authenticated users
    - Grant necessary permissions
*/

-- Drop existing tables if they exist
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

-- Create policies for backups
CREATE POLICY "backups_select"
ON backups FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "backups_insert"
ON backups FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "backups_delete"
ON backups FOR DELETE TO authenticated
USING (auth.role() = 'authenticated');

-- Create policies for backup_logs
CREATE POLICY "backup_logs_select"
ON backup_logs FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "backup_logs_insert"
ON backup_logs FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Grant minimal required permissions
GRANT SELECT, INSERT, DELETE ON backups TO authenticated;
GRANT SELECT, INSERT ON backup_logs TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);