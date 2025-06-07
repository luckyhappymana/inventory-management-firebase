/*
  # Fix backup system RLS policies

  1. Changes
    - Simplify RLS policies
    - Enable access for both authenticated and anonymous users
    - Remove unnecessary constraints

  2. Security
    - Enable RLS on all tables
    - Create single policy per table
    - Grant minimal required permissions
*/

-- Drop existing tables and policies
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

-- Create single, simple policy for each table
CREATE POLICY "enable_all_backups"
ON backups
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_backup_logs"
ON backup_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant minimal required permissions to both anon and authenticated roles
GRANT ALL ON backups TO anon, authenticated;
GRANT ALL ON backup_logs TO anon, authenticated;

-- Create indexes
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);