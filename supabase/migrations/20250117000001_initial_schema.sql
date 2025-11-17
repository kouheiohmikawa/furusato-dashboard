-- ============================================================================
-- Initial Database Schema for Furusato Dashboard
-- ============================================================================
-- このマイグレーションは、ふるさと納税ダッシュボードの初期スキーマを作成します。
--
-- テーブル構成:
-- 1. profiles: ユーザープロフィール情報
-- 2. donations: 寄付記録
-- 3. simulation_history: シミュレーション履歴
-- 4. municipalities: 自治体情報（将来の拡張用）
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Profiles Table (ユーザープロフィール)
-- ============================================================================
-- auth.usersテーブルと1:1の関係を持つプロフィール情報
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  prefecture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- プロフィールテーブルのインデックス
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- プロフィールのupdated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. Donations Table (寄付記録)
-- ============================================================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality_name TEXT NOT NULL,
  prefecture TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  donation_date DATE NOT NULL,
  return_item_name TEXT,
  is_one_stop BOOLEAN DEFAULT false NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 寄付記録テーブルのインデックス
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_donation_date ON donations(donation_date DESC);
CREATE INDEX idx_donations_user_date ON donations(user_id, donation_date DESC);

-- 寄付記録のupdated_at自動更新トリガー
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. Simulation History Table (シミュレーション履歴)
-- ============================================================================
CREATE TABLE simulation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('simple', 'detailed')),
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- シミュレーション履歴テーブルのインデックス
CREATE INDEX idx_simulation_history_user_id ON simulation_history(user_id);
CREATE INDEX idx_simulation_history_created_at ON simulation_history(created_at DESC);
CREATE INDEX idx_simulation_history_user_created ON simulation_history(user_id, created_at DESC);

-- ============================================================================
-- 4. Municipalities Table (自治体情報) - 将来の拡張用
-- ============================================================================
CREATE TABLE municipalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 自治体テーブルのインデックス
CREATE INDEX idx_municipalities_prefecture ON municipalities(prefecture);
CREATE INDEX idx_municipalities_name ON municipalities(name);

-- 自治体のupdated_at自動更新トリガー
CREATE TRIGGER update_municipalities_updated_at
  BEFORE UPDATE ON municipalities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments (テーブル・カラムの説明)
-- ============================================================================

COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN profiles.id IS 'ユーザーID (auth.usersと同じ)';
COMMENT ON COLUMN profiles.display_name IS '表示名';
COMMENT ON COLUMN profiles.prefecture IS '都道府県';

COMMENT ON TABLE donations IS '寄付記録';
COMMENT ON COLUMN donations.user_id IS '寄付したユーザーのID';
COMMENT ON COLUMN donations.municipality_name IS '寄付先自治体名';
COMMENT ON COLUMN donations.prefecture IS '都道府県';
COMMENT ON COLUMN donations.amount IS '寄付金額（円）';
COMMENT ON COLUMN donations.donation_date IS '寄付日';
COMMENT ON COLUMN donations.return_item_name IS '返礼品名';
COMMENT ON COLUMN donations.is_one_stop IS 'ワンストップ特例制度を利用するか';
COMMENT ON COLUMN donations.memo IS 'メモ';

COMMENT ON TABLE simulation_history IS 'シミュレーション履歴';
COMMENT ON COLUMN simulation_history.user_id IS 'シミュレーションを実行したユーザーのID';
COMMENT ON COLUMN simulation_history.simulation_type IS 'シミュレーションタイプ (simple/detailed)';
COMMENT ON COLUMN simulation_history.input_data IS '入力データ (JSON形式)';
COMMENT ON COLUMN simulation_history.result_data IS '計算結果データ (JSON形式)';

COMMENT ON TABLE municipalities IS '自治体情報（将来の拡張用）';
COMMENT ON COLUMN municipalities.name IS '自治体名';
COMMENT ON COLUMN municipalities.prefecture IS '都道府県';
COMMENT ON COLUMN municipalities.code IS '自治体コード';
COMMENT ON COLUMN municipalities.description IS '説明';
COMMENT ON COLUMN municipalities.website_url IS 'ウェブサイトURL';
