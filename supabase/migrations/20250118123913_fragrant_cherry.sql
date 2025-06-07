/*
  # Fix withdrawal records table

  1. Changes
    - Add item_code and item_name columns to withdrawal_records table
    - Add missing indexes
    - Update RLS policies
*/

-- Add new columns to withdrawal_records table
ALTER TABLE withdrawal_records
ADD COLUMN IF NOT EXISTS item_code TEXT,
ADD COLUMN IF NOT EXISTS item_name TEXT;

-- Update existing records with item information
UPDATE withdrawal_records w
SET 
  item_code = i.code,
  item_name = i.name
FROM items i
WHERE w.item_id = i.id
AND w.item_code IS NULL;

-- Make the new columns required for future records
ALTER TABLE withdrawal_records
ALTER COLUMN item_code SET NOT NULL,
ALTER COLUMN item_name SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_code ON withdrawal_records(item_code);
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_id ON withdrawal_records(item_id);

-- Recreate RLS policies with proper access control
DROP POLICY IF EXISTS "withdrawal_records_select" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_insert" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_update" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_delete" ON withdrawal_records;

CREATE POLICY "withdrawal_records_select"
ON withdrawal_records FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "withdrawal_records_insert"
ON withdrawal_records FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "withdrawal_records_update"
ON withdrawal_records FOR UPDATE TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "withdrawal_records_delete"
ON withdrawal_records FOR DELETE TO authenticated, anon
USING (true);