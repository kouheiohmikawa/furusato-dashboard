# Supabase データベースマイグレーション

このディレクトリには、Supabaseデータベースのマイグレーションファイルが含まれています。

## マイグレーションファイル

### 20250117000001_initial_schema.sql
初期データベーススキーマを作成します。

**含まれるテーブル:**
- `profiles`: ユーザープロフィール情報
- `donations`: 寄付記録
- `simulation_history`: シミュレーション履歴
- `municipalities`: 自治体情報（将来の拡張用）

### 20250117000002_rls_policies.sql
Row Level Security (RLS) ポリシーを設定します。

**セキュリティポリシー:**
- ユーザーは自分のデータのみにアクセス可能
- 自治体情報は全ユーザーが閲覧可能

## マイグレーションの適用方法

### 方法1: Supabase SQL Editor（推奨）

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択
4. 「New Query」をクリック
5. マイグレーションファイルの内容をコピー&ペースト
6. 「Run」をクリックして実行
7. すべてのマイグレーションファイルに対して繰り返し

**実行順序:**
```
1. 20250117000001_initial_schema.sql
2. 20250117000002_rls_policies.sql
```

### 方法2: Supabase CLI

Supabase CLIを使用する場合:

```bash
# Supabase CLIのインストール（まだの場合）
npm install -g supabase

# Supabaseプロジェクトにリンク
supabase link --project-ref your-project-ref

# マイグレーションを適用
supabase db push
```

## 確認方法

マイグレーションが正しく適用されたか確認するには:

1. Supabase Dashboardの「Table Editor」でテーブルが表示されることを確認
2. 「Database」→「Policies」でRLSポリシーが設定されていることを確認

## トラブルシューティング

### エラーが発生した場合

- マイグレーションファイルを実行順序通りに適用しているか確認
- Supabase Dashboardの「Database」→「Logs」でエラーログを確認
- すでに同じテーブルが存在していないか確認

### テーブルをリセットしたい場合

⚠️ **警告: すべてのデータが削除されます**

```sql
-- すべてのテーブルを削除
DROP TABLE IF EXISTS municipalities CASCADE;
DROP TABLE IF EXISTS simulation_history CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS is_authenticated();
DROP FUNCTION IF EXISTS is_owner(UUID);
```

その後、マイグレーションファイルを再度実行してください。

## 型定義の更新

データベーススキーマを変更した場合、TypeScript型定義も更新する必要があります:

```bash
# Supabase CLIで型定義を自動生成（オプション）
supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

現在は手動で `src/types/database.types.ts` を管理しています。
