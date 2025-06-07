/*
  # Fix RLS Policies for Inventory System

  1. Security Changes
    - Drop all existing policies
    - Create new simplified policies that allow full access to authenticated users
    - Ensure policies are properly scoped to authenticated users only
    
  2. Important Notes
    - All tables will have RLS enabled
    - Only authenticated users can perform CRUD operations
    - Policies use simple true/false conditions for clarity
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable shared access for items" ON items;
DROP POLICY IF EXISTS "Enable shared access for transactions" ON transactions;
DROP POLICY IF EXISTS "Enable shared access for withdrawal_records" ON withdrawal_records;

-- Ensure RLS is enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for authenticated users
CREATE POLICY "authenticated_users_items"
ON items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_transactions"
ON transactions FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_withdrawal_records"
ON withdrawal_records FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON items TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON withdrawal_records TO authenticated;