/*
  # Set up shared authentication and data sync

  1. Tables
    - Update items table for shared access
    - Update transactions table for shared access
    - Update withdrawal_records table for shared access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;

-- Create policies for shared access
CREATE POLICY "Enable shared access for items"
ON items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable shared access for transactions"
ON transactions FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable shared access for withdrawal_records"
ON withdrawal_records FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_created_at ON withdrawal_records(created_at);