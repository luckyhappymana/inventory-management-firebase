-- Drop existing policies
DROP POLICY IF EXISTS "items_policy" ON items;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "withdrawal_records_policy" ON withdrawal_records;

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "enable_all_items"
ON items FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_transactions"
ON transactions FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_all_withdrawal_records"
ON withdrawal_records FOR ALL
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON items TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON withdrawal_records TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;