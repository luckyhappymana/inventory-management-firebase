/*
  # Add app_versions table
  
  1. New Tables
    - `app_versions`
      - `id` (uuid, primary key)
      - `version` (text, not null)
      - `required` (boolean, default false)
      - `message` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `app_versions` table
    - Add policy for authenticated users to read version data
*/

-- Create app_versions table
CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON app_versions FOR SELECT TO authenticated
USING (true);

-- Add initial version
INSERT INTO app_versions (version, required, message)
VALUES ('1.0.0', false, '初期バージョン');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_app_versions_created_at ON app_versions(created_at);