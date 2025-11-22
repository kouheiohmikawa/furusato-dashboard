-- Migration: Add prefecture and municipality columns to donations table
-- Date: 2025-11-22
-- Description: Separate municipality_name into prefecture and municipality for better data organization

-- Add new columns
ALTER TABLE donations
  ADD COLUMN prefecture VARCHAR(10),
  ADD COLUMN municipality VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN donations.prefecture IS '都道府県名（例: 東京都、北海道）';
COMMENT ON COLUMN donations.municipality IS '市区町村名（例: 渋谷区、札幌市）';

-- Make municipality_name nullable for backward compatibility
-- (We'll keep it for now to avoid breaking existing data)
ALTER TABLE donations
  ALTER COLUMN municipality_name DROP NOT NULL;

-- Optional: Migrate existing data (if needed)
-- This example assumes municipality_name contains both prefecture and municipality
-- Example: "東京都渋谷区" -> prefecture: "東京都", municipality: "渋谷区"
-- Note: This is a simple example and may need adjustment based on actual data format

-- Update existing records (if municipality_name follows the pattern "都道府県+市区町村")
-- UPDATE donations
-- SET
--   prefecture = CASE
--     WHEN municipality_name LIKE '北海道%' THEN '北海道'
--     WHEN municipality_name LIKE '東京都%' THEN '東京都'
--     WHEN municipality_name LIKE '京都府%' THEN '京都府'
--     WHEN municipality_name LIKE '大阪府%' THEN '大阪府'
--     WHEN municipality_name LIKE '%県%' THEN SUBSTRING(municipality_name, 1, POSITION('県' IN municipality_name))
--     ELSE NULL
--   END,
--   municipality = CASE
--     WHEN municipality_name LIKE '北海道%' THEN SUBSTRING(municipality_name, 4)
--     WHEN municipality_name LIKE '東京都%' THEN SUBSTRING(municipality_name, 4)
--     WHEN municipality_name LIKE '京都府%' THEN SUBSTRING(municipality_name, 4)
--     WHEN municipality_name LIKE '大阪府%' THEN SUBSTRING(municipality_name, 4)
--     WHEN municipality_name LIKE '%県%' THEN SUBSTRING(municipality_name, POSITION('県' IN municipality_name) + 1)
--     ELSE municipality_name
--   END
-- WHERE prefecture IS NULL AND municipality IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_prefecture ON donations(prefecture);
CREATE INDEX IF NOT EXISTS idx_donations_municipality ON donations(municipality);
