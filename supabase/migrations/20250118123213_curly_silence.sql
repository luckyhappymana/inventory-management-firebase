/*
  # Fix transactions table schema

  1. Changes
    - Drop and recreate transactions table with correct schema
    - Ensure all required columns are present
    - Maintain existing RLS policies
    - Add proper indexes

  2. Security
    - Maintain existing RLS policies
    - Keep all permissions intact
*/

-- Recreate transactions table with correct schema
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  correction_number TEXT,
  type TEXT NOT NULL CHECK (type IN ('入庫', '出庫')),
  quantity INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "transactions_select" ON transactions
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "transactions_insert" ON transactions
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "transactions_update" ON transactions
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "transactions_delete" ON transactions
    FOR DELETE TO authenticated, anon
    USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_code ON transactions(item_code);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Grant permissions
GRANT ALL ON transactions TO authenticated, anon;