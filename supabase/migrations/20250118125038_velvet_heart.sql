/*
  # Fix RLS policies for withdrawal records

  1. Changes
    - Recreate withdrawal_records table with proper schema
    - Add proper RLS policies
    - Add necessary indexes
    - Grant proper permissions

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Recreate withdrawal_records table with proper schema
CREATE TABLE IF NOT EXISTS withdrawal_records_new (
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

-- Copy data if old table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'withdrawal_records') THEN
    INSERT INTO withdrawal_records_new
    SELECT * FROM withdrawal_records;
  END IF;
END $$;

-- Drop old table and rename new one
DROP TABLE IF EXISTS withdrawal_records CASCADE;
ALTER TABLE withdrawal_records_new RENAME TO withdrawal_records;

-- Enable RLS
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create single policy for all operations
CREATE POLICY "withdrawal_records_policy"
ON withdrawal_records
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_id 
ON withdrawal_records(item_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_code 
ON withdrawal_records(item_code);

CREATE INDEX IF NOT EXISTS idx_withdrawal_records_created_at 
ON withdrawal_records(created_at);

-- Grant permissions
GRANT ALL ON withdrawal_records TO authenticated;