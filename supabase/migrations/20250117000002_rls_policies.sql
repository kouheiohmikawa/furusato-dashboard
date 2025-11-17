-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
-- このマイグレーションは、各テーブルに対するRLSポリシーを設定します。
-- ユーザーは自分のデータのみにアクセスできるようになります。
-- ============================================================================

-- ============================================================================
-- 1. Profiles Table RLS
-- ============================================================================

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ作成可能
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ削除可能
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- 2. Donations Table RLS
-- ============================================================================

-- RLSを有効化
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の寄付記録のみ閲覧可能
CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の寄付記録のみ作成可能
CREATE POLICY "Users can create their own donations"
  ON donations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の寄付記録のみ更新可能
CREATE POLICY "Users can update their own donations"
  ON donations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の寄付記録のみ削除可能
CREATE POLICY "Users can delete their own donations"
  ON donations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Simulation History Table RLS
-- ============================================================================

-- RLSを有効化
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のシミュレーション履歴のみ閲覧可能
CREATE POLICY "Users can view their own simulation history"
  ON simulation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のシミュレーション履歴のみ作成可能
CREATE POLICY "Users can create their own simulation history"
  ON simulation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のシミュレーション履歴のみ削除可能
-- (シミュレーション履歴は更新不可、削除のみ可能)
CREATE POLICY "Users can delete their own simulation history"
  ON simulation_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Municipalities Table RLS
-- ============================================================================

-- RLSを有効化
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが自治体情報を閲覧可能（公開データ）
CREATE POLICY "Anyone can view municipalities"
  ON municipalities
  FOR SELECT
  USING (true);

-- 自治体情報の作成・更新・削除は管理者のみ（将来の拡張用）
-- 現時点では誰も作成・更新・削除できない設定
CREATE POLICY "Only admins can manage municipalities"
  ON municipalities
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Helper Functions for RLS
-- ============================================================================

-- ユーザーがログインしているかチェックする関数
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 特定のユーザーのデータかチェックする関数
CREATE OR REPLACE FUNCTION is_owner(owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
