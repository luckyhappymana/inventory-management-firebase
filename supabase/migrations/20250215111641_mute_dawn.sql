/*
  # Backup System Fix

  1. New Tables
    - `backups`
      - `id` (uuid, primary key)
      - `data` (text, encrypted backup data)
      - `metadata` (jsonb, backup metadata)
      - `created_at` (timestamptz)
    - `backup_logs`
      - `id` (uuid, primary key)
      - `type` (text, check constraint)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Create policies for authenticated users
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
CREATE POLICY "backups_policy"
ON backups FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for backup_logs
CREATE POLICY "backup_logs_policy"
ON backup_logs FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON backups TO authenticated;
GRANT ALL ON backup_logs TO authenticated;

-- Create indexes
CREATE INDEX idx_backups_created_at ON backups(created_at);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_type ON backup_logs(type);