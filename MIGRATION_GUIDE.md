# Supabase マイグレーション実行ガイド

このガイドでは、Supabaseデータベースのマイグレーションを実行する手順を説明します。

## 📋 前提条件

- ✅ Supabaseプロジェクト（furusato-dashboard-dev）が作成済み
- ✅ `.env.local`ファイルにSupabaseの認証情報が設定済み

## 🚀 マイグレーション実行手順

### Step 1: Supabase Dashboardにアクセス

1. [Supabase Dashboard](https://app.supabase.com) を開く
2. `furusato-dashboard-dev` プロジェクトを選択

### Step 2: SQL Editorを開く

1. 左サイドバーから **「SQL Editor」** を選択
2. **「New Query」** ボタンをクリック

### Step 3: 初期スキーマの作成

1. `supabase/migrations/20250117000001_initial_schema.sql` ファイルを開く
2. ファイルの内容を **すべてコピー**
3. SQL Editorに **ペースト**
4. **「Run」** ボタンをクリックして実行

**✅ 成功の確認:**
- エラーが表示されないこと
- 左サイドバーの「Table Editor」に以下のテーブルが表示されること：
  - `profiles`
  - `donations`
  - `simulation_history`
  - `municipalities`

### Step 4: RLSポリシーの設定

1. SQL Editorで **「New Query」** をクリック
2. `supabase/migrations/20250117000002_rls_policies.sql` ファイルを開く
3. ファイルの内容を **すべてコピー**
4. SQL Editorに **ペースト**
5. **「Run」** ボタンをクリックして実行

**✅ 成功の確認:**
1. 左サイドバーから **「Authentication」** → **「Policies」** を選択
2. 各テーブルにポリシーが設定されていることを確認：
   - `profiles`: 4つのポリシー（SELECT, INSERT, UPDATE, DELETE）
   - `donations`: 4つのポリシー
   - `simulation_history`: 3つのポリシー（SELECT, INSERT, DELETE）
   - `municipalities`: 2つのポリシー

## 🔍 マイグレーション確認

### テーブル構造の確認

左サイドバーから「Table Editor」を選択し、各テーブルをクリックして構造を確認：

#### 1. profiles テーブル
```
id (uuid, primary key)
display_name (text, nullable)
prefecture (text, nullable)
created_at (timestamp)
updated_at (timestamp)
```

#### 2. donations テーブル
```
id (uuid, primary key)
user_id (uuid, foreign key)
municipality_name (text)
prefecture (text, nullable)
amount (integer)
donation_date (date)
return_item_name (text, nullable)
is_one_stop (boolean)
memo (text, nullable)
created_at (timestamp)
updated_at (timestamp)
```

#### 3. simulation_history テーブル
```
id (uuid, primary key)
user_id (uuid, foreign key)
simulation_type (text)
input_data (jsonb)
result_data (jsonb)
created_at (timestamp)
```

#### 4. municipalities テーブル
```
id (uuid, primary key)
name (text)
prefecture (text)
code (text, unique, nullable)
description (text, nullable)
website_url (text, nullable)
created_at (timestamp)
updated_at (timestamp)
```

### RLSポリシーの確認

「Authentication」→「Policies」で以下を確認：

- ✅ すべてのテーブルでRLSが有効化されている
- ✅ 各テーブルに適切なポリシーが設定されている
- ✅ ユーザーは自分のデータのみアクセス可能

## ❌ トラブルシューティング

### エラー: "relation already exists"

すでにテーブルが存在する場合のエラーです。

**解決方法:**
1. SQL Editorで既存テーブルを削除:
```sql
DROP TABLE IF EXISTS municipalities CASCADE;
DROP TABLE IF EXISTS simulation_history CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS is_authenticated();
DROP FUNCTION IF EXISTS is_owner(UUID);
```
2. マイグレーションを再度実行

### エラー: "permission denied"

権限エラーの場合、プロジェクトの所有者アカウントでログインしているか確認してください。

### エラー: "syntax error"

SQLの構文エラーです。ファイルの内容を正確にコピーしているか確認してください。

## ✅ 次のステップ

マイグレーションが完了したら、次のタスクに進みます：

1. ✅ Task 5: Supabaseでテーブル作成とマイグレーション実行 （完了）
2. ✅ Task 6: Row Level Security（RLS）ポリシーの設定 （完了）
3. ⏭️ Task 7: Supabase Authのメール認証設定

---

## 📝 補足情報

### マイグレーションファイルの管理

- マイグレーションファイルは `supabase/migrations/` ディレクトリに保存
- ファイル名は `YYYYMMDDHHMMSS_description.sql` 形式
- バージョン管理システム（Git）で管理

### 本番環境への適用

開発環境で動作確認後、本番環境（furusato-dashboard-prod）にも同じマイグレーションを適用します。

### データベース型定義の同期

データベーススキーマを変更した場合、`src/types/database.types.ts` も更新してください。
