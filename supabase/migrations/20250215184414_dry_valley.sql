-- Drop existing policies
DROP POLICY IF EXISTS "enable_all_backups" ON backups;
DROP POLICY IF EXISTS "enable_all_backup_logs" ON backup_logs;
DROP POLICY IF EXISTS "items_policy" ON items;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "withdrawal_records_policy" ON withdrawal_records;

-- Ensure unit column exists and is not null
ALTER TABLE withdrawal_records 
ALTER COLUMN unit SET NOT NULL,
ALTER COLUMN unit SET DEFAULT '個';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_id ON withdrawal_records(item_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_item_code ON withdrawal_records(item_code);

-- Create simplified policies for authenticated users
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

-- Grant necessary permissions
GRANT ALL ON items TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON withdrawal_records TO authenticated;