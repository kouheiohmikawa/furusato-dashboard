-- ============================================================================
-- Add Return Item Column to Donations Table
-- ============================================================================
-- donationsテーブルに返礼品（return_item）カラムを追加します。

-- 返礼品カラムを追加
ALTER TABLE donations ADD COLUMN return_item TEXT;

-- コメントを追加
COMMENT ON COLUMN donations.return_item IS '返礼品の内容（例: 和牛切り落とし 1kg、お米 10kg など）';
