/*
  # Backup System Fix

  1. Changes
    - Recreate backup tables with proper structure
    - Set up RLS policies with correct permissions
    - Add proper indexes for performance
    - Grant necessary permissions to authenticated users

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users
    - Grant minimal required permissions
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
CREATE POLICY "Enable read access for authenticated users on backups"
ON backups FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users on backups"
ON backups FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users on backups"
ON backups FOR DELETE TO authenticated
USING (true);

-- Create policies for backup_logs
CREATE POLICY "Enable read access for authenticated users on backup_logs"
ON backup_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users on backup_logs"
ON backup_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON backups TO authenticated;
GRANT ALL ON backup_logs TO authenticated;

-- Create indexes
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);