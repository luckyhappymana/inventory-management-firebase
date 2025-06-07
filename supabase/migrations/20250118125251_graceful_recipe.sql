/*
  # Fix RLS policies and permissions

  1. Changes
    - Drop all existing policies
    - Create new simplified policies for all tables
    - Grant proper permissions to authenticated users
    - Remove anon access completely

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
    - Ensure proper authentication checks
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "withdrawal_records_policy" ON withdrawal_records;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "items_policy" ON items;

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for authenticated users only
CREATE POLICY "items_policy"
ON items FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "transactions_policy"
ON transactions FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "withdrawal_records_policy"
ON withdrawal_records FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Revoke all permissions from anon role
REVOKE ALL ON items FROM anon;
REVOKE ALL ON transactions FROM anon;
REVOKE ALL ON withdrawal_records FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE USAGE ON SCHEMA public FROM anon;

-- Grant permissions to authenticated users only
GRANT ALL ON items TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON withdrawal_records TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;