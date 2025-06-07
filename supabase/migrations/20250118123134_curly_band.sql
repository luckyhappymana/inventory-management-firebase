-- Add correction_number column to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'transactions' 
    AND column_name = 'correction_number'
  ) THEN
    ALTER TABLE transactions ADD COLUMN correction_number TEXT;
  END IF;
END $$;

-- Update existing transactions to include correction_number from items
UPDATE transactions t
SET correction_number = i.correction_number
FROM items i
WHERE t.item_id = i.id
AND t.correction_number IS NULL;