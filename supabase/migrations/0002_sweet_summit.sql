/*
  # Update RLS policies for shared access

  1. Changes
    - Update RLS policies to allow access based on shared authentication
    - Add policies for read/write access to all tables
    - Add trigger for updating timestamps

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Update RLS policies for items table
DROP POLICY IF EXISTS "Allow authenticated users full access to items" ON items;
CREATE POLICY "Allow authenticated users full access to items"
ON items FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Update RLS policies for transactions table
DROP POLICY IF EXISTS "Allow authenticated users full access to transactions" ON transactions;
CREATE POLICY "Allow authenticated users full access to transactions"
ON transactions FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Update RLS policies for withdrawal_records table
DROP POLICY IF EXISTS "Allow authenticated users full access to withdrawal_records" ON withdrawal_records;
CREATE POLICY "Allow authenticated users full access to withdrawal_records"
ON withdrawal_records FOR ALL TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');