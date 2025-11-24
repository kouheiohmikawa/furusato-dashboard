-- ============================================================================
-- Add Missing Columns Migration
-- ============================================================================
-- 本番環境では2025-11-23に手動実行済みですが、履歴記録と
-- 他の環境（ステージング、ローカル等）での再現性のために作成します。
--
-- IF NOT EXISTSを使用することで、既存環境でエラーが発生しないようにします。
-- ============================================================================

-- ============================================================================
-- 1. プロフィールテーブル: 手動上限額設定機能
-- ============================================================================
-- ユーザーがシミュレーション結果を上書きして手動で上限額を設定できる機能
-- NULL許可（手動設定していない場合はシミュレーション結果を使用）

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'manual_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN manual_limit INTEGER;
    COMMENT ON COLUMN profiles.manual_limit IS 'ユーザーが手動設定した上限額（シミュレーション結果を上書き）';
  END IF;
END $$;

-- ============================================================================
-- 2. 寄付テーブル: 都道府県・自治体名フィールド
-- ============================================================================
-- 寄付先の都道府県と自治体名を個別に記録
-- NULL許可（任意項目）

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'prefecture'
  ) THEN
    ALTER TABLE donations ADD COLUMN prefecture TEXT;
    COMMENT ON COLUMN donations.prefecture IS '寄付先の都道府県';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'municipality'
  ) THEN
    ALTER TABLE donations ADD COLUMN municipality TEXT;
    COMMENT ON COLUMN donations.municipality IS '寄付先の自治体名（市区町村）';
  END IF;
END $$;

-- ============================================================================
-- 3. 寄付テーブル: ポータルサイトトラッキング
-- ============================================================================
-- どのポータルサイト（ふるさとチョイス、楽天ふるさと納税など）で
-- 寄付したかを記録
-- NULL許可（任意項目）

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'portal_site'
  ) THEN
    ALTER TABLE donations ADD COLUMN portal_site VARCHAR(100);
    COMMENT ON COLUMN donations.portal_site IS 'ポータルサイト名（ふるさとチョイス、楽天など）';
  END IF;
END $$;

-- ============================================================================
-- 影響範囲の説明
-- ============================================================================
--
-- ### manual_limit
-- - src/types/database.types.ts - 型定義追加済み
-- - src/components/profile/ProfileForm.tsx - UI実装済み
-- - src/app/actions/profile.ts - 保存処理実装済み
-- - src/app/dashboard/page.tsx - 優先度ロジック実装済み
--
-- ### prefecture, municipality
-- - src/types/database.types.ts - 型定義追加済み
-- - src/components/donations/DonationForm.tsx - 登録フォーム実装済み
-- - src/components/donations/DonationEditForm.tsx - 編集フォーム実装済み
-- - src/app/actions/donations.ts - 保存/更新処理実装済み
--
-- ### portal_site
-- - src/types/database.types.ts - 型定義追加済み
-- - src/lib/constants/donations.ts - 9つのポータルサイト定義済み
-- - src/components/donations/DonationForm.tsx - 登録フォーム実装済み
-- - src/components/donations/DonationEditForm.tsx - 編集フォーム実装済み
-- - src/app/actions/donations.ts - 保存/更新処理実装済み
-- - src/components/dashboard/DonationOverview.tsx - 統計表示実装済み
-- ============================================================================
