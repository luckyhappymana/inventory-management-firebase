/*
  # Fix RLS policies for all tables

  1. Changes
    - Drop all existing policies
    - Create new simplified policies for all tables
    - Grant proper permissions to authenticated users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
    - Remove anon access completely
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "withdrawal_records_policy" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_select" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_insert" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_update" ON withdrawal_records;
DROP POLICY IF EXISTS "withdrawal_records_delete" ON withdrawal_records;

DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

DROP POLICY IF EXISTS "items_policy" ON items;
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for authenticated users only
CREATE POLICY "items_policy"
ON items FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "transactions_policy"
ON transactions FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "withdrawal_records_policy"
ON withdrawal_records FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions to authenticated users only
GRANT ALL ON items TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON withdrawal_records TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;