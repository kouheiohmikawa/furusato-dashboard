-- ============================================================================
-- Cleanup Script for One-to-One Migration
-- ============================================================================
-- このスクリプトは、多対多テーブルを削除して一対一設計に移行するためのものです。
-- dev環境で実行してください。
-- ============================================================================

-- 1. 中間テーブルを削除（既存のポリシーも一緒に削除される）
DROP TABLE IF EXISTS donation_return_item_tags CASCADE;

-- 2. donations.product_urlカラムを削除（再作成するため）
ALTER TABLE donations DROP COLUMN IF EXISTS product_url;

-- 3. donations.subcategory_idカラムを削除（存在する場合）
ALTER TABLE donations DROP COLUMN IF EXISTS subcategory_id;

-- 完了メッセージ
SELECT 'Cleanup completed. Now run the main migration file.' AS message;
