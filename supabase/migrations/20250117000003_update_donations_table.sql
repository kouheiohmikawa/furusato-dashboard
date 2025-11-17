-- ============================================================================
-- Update Donations Table Schema
-- ============================================================================
-- donationsテーブルにアプリケーションで使用するカラムを追加し、
-- 古いカラムを削除します。

-- 新しいカラムを追加
ALTER TABLE donations ADD COLUMN donation_type TEXT;
ALTER TABLE donations ADD COLUMN payment_method TEXT;
ALTER TABLE donations ADD COLUMN receipt_number TEXT;
ALTER TABLE donations ADD COLUMN notes TEXT;

-- 古いカラムからデータを移行
UPDATE donations SET notes = memo WHERE memo IS NOT NULL;

-- 古いカラムを削除
ALTER TABLE donations DROP COLUMN return_item_name;
ALTER TABLE donations DROP COLUMN is_one_stop;
ALTER TABLE donations DROP COLUMN memo;
ALTER TABLE donations DROP COLUMN prefecture;

-- コメントを追加
COMMENT ON COLUMN donations.donation_type IS '寄付の種類（返礼品あり、返礼品なし、災害支援など）';
COMMENT ON COLUMN donations.payment_method IS '支払い方法（クレジットカード、銀行振込など）';
COMMENT ON COLUMN donations.receipt_number IS '受領証明書番号';
COMMENT ON COLUMN donations.notes IS 'メモ・備考';
