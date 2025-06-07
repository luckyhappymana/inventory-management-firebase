/*
  # Fix backup system and RLS policies

  1. Changes
    - Simplify backup tables structure
    - Remove unnecessary constraints
    - Add proper indexes
    - Simplify RLS policies

  2. Security
    - Enable RLS on all tables
    - Create simple, permissive policies
    - Grant necessary permissions
*/

-- Drop existing tables and policies
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

-- Create simple, permissive policies
CREATE POLICY "enable_all_backups"
ON backups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_backup_logs"
ON backup_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON backups TO authenticated;
GRANT ALL ON backup_logs TO authenticated;

-- Create indexes
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);