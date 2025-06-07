/*
  # Fix RLS policies and permissions

  1. Changes
    - Drop existing policies
    - Create new simplified policies for authenticated users
    - Set up proper RLS for all tables
    - Grant minimal required permissions

  2. Security
    - Enable RLS on all tables
    - Restrict access to authenticated users only
    - Use proper auth checks in policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "items_policy" ON items;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "withdrawal_records_policy" ON withdrawal_records;

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

-- Grant minimal required permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON withdrawal_records TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;