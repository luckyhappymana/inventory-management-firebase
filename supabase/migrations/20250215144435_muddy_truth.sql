/*
  # Add unit column to withdrawal_records table

  1. Changes
    - Add unit column to withdrawal_records table with default value '個'
    - Update existing records to use default unit
*/

-- Add unit column with default value
ALTER TABLE withdrawal_records
ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT '個';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_unit ON withdrawal_records(unit);