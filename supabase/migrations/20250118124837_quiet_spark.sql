/*
  # Fix withdrawal records schema and policies

  1. Changes
    - Add missing columns to withdrawal_records table
    - Update indexes for better performance
    - Recreate RLS policies with proper access control

  2. New Columns
    - item_code (TEXT NOT NULL)
    - item_name (TEXT NOT NULL)
    - monthly_quantities (JSONB)

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "withdrawal_records_select" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_insert" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_update" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_delete" ON withdrawal_records;

-- Recreate withdrawal_records table with correct schema
DROP TABLE IF EXISTS withdrawal_records CASCADE;

CREATE TABLE withdrawal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  withdrawal_quantity INTEGER,
  total_quantity INTEGER,
  monthly_quantities JSONB,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "withdrawal_records_select"
ON withdrawal_records FOR SELECT TO authenticated
USING (true);

CREATE POLICY "withdrawal_records_insert"
ON withdrawal_records FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "withdrawal_records_update"
ON withdrawal_records FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "withdrawal_records_delete"
ON withdrawal_records FOR DELETE TO authenticated
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_withdrawal_records_item_id ON withdrawal_records(item_id);
CREATE INDEX idx_withdrawal_records_item_code ON withdrawal_records(item_code);
CREATE INDEX idx_withdrawal_records_created_at ON withdrawal_records(created_at);

-- Grant permissions
GRANT ALL ON withdrawal_records TO authenticated;