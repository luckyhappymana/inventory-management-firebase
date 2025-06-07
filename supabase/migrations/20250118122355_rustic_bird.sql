/*
  # Fix RLS Policies and Authentication

  1. Security Changes
    - Drop all existing policies
    - Create new policies with explicit operation types
    - Add anon role access for authentication
    - Grant explicit table permissions
    
  2. Important Notes
    - Separate policies for different operations (SELECT, INSERT, UPDATE, DELETE)
    - Include both authenticated and anon roles where needed
    - Explicit permission grants
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "authenticated_users_items" ON items;
DROP POLICY IF EXISTS "authenticated_users_transactions" ON transactions;
DROP POLICY IF EXISTS "authenticated_users_withdrawal_records" ON withdrawal_records;

-- Ensure RLS is enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Items table policies
CREATE POLICY "items_select" ON items
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "items_insert" ON items
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "items_update" ON items
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "items_delete" ON items
    FOR DELETE TO authenticated, anon
    USING (true);

-- Transactions table policies
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

-- Withdrawal records table policies
CREATE POLICY "withdrawal_records_select" ON withdrawal_records
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "withdrawal_records_insert" ON withdrawal_records
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "withdrawal_records_update" ON withdrawal_records
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "withdrawal_records_delete" ON withdrawal_records
    FOR DELETE TO authenticated, anon
    USING (true);

-- Grant permissions to both authenticated and anon roles
GRANT ALL ON items TO authenticated, anon;
GRANT ALL ON transactions TO authenticated, anon;
GRANT ALL ON withdrawal_records TO authenticated, anon;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;