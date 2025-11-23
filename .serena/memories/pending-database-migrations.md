# 実行待ちのデータベースマイグレーション

## 概要
アプリケーションコードは実装済みだが、Supabaseでのデータベースマイグレーションがまだ実行されていない項目のリスト。

---

## 🔴 実行が必要なSQL

### 1. 手動上限額設定機能（manual_limit）

**実装日**: 2025-01-22  
**コミット**: `f9319cc`, `10b9b4b`, `31ad0bf`

**SQL**:
```sql
ALTER TABLE profiles ADD COLUMN manual_limit INTEGER;
```

**説明**:
- プロフィールテーブルに`manual_limit`カラムを追加
- ユーザーがシミュレーション結果を上書きして手動で上限額を設定できる機能
- NULL許可（手動設定していない場合はシミュレーション結果を使用）

**影響範囲**:
- `src/types/database.types.ts` - 型定義に追加済み
- `src/components/profile/ProfileForm.tsx` - UI実装済み
- `src/app/actions/profile.ts` - 保存処理実装済み
- `src/app/dashboard/page.tsx` - 優先度ロジック実装済み

---

### 2. ポータルサイトトラッキング機能（portal_site）

**実装日**: 2025-01-22  
**コミット**: `0900c6e`

**SQL**:
```sql
ALTER TABLE donations ADD COLUMN portal_site VARCHAR(100);
COMMENT ON COLUMN donations.portal_site IS 'ポータルサイト名（ふるさとチョイス、楽天など）';
```

**説明**:
- 寄付テーブルに`portal_site`カラムを追加
- どのポータルサイト（ふるさとチョイス、楽天ふるさと納税など）で寄付したかを記録
- NULL許可（任意項目）

**影響範囲**:
- `src/types/database.types.ts` - 型定義に追加済み
- `src/lib/constants/donations.ts` - 9つのポータルサイト定義済み
- `src/components/donations/DonationForm.tsx` - 登録フォーム実装済み
- `src/components/donations/DonationEditForm.tsx` - 編集フォーム実装済み
- `src/app/actions/donations.ts` - 保存/更新処理実装済み
- `src/components/dashboard/DonationOverview.tsx` - 統計表示実装済み

---

## 実行手順

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左サイドバーから「SQL Editor」をクリック
   - 「New query」をクリック

3. **SQLを実行**
   - 上記のSQLを貼り付け
   - 「Run」ボタンをクリック

4. **確認**
   - 「Table Editor」からテーブル構造を確認
   - 新しいカラムが追加されていることを確認

---

## 実行後の確認項目

### manual_limit
- [ ] プロフィール編集ページで手動上限額を設定できる
- [ ] ダッシュボードで「手動設定」バッジが表示される
- [ ] 手動設定値がシミュレーション結果より優先される

### portal_site
- [ ] 寄付登録時にポータルサイトを選択できる
- [ ] 寄付編集時にポータルサイトを変更できる
- [ ] ダッシュボードで「ポータルサイト別の内訳」が表示される
- [ ] 各ポータルサイトの寄付額・件数・割合が確認できる

---

## 注意事項

- これらのマイグレーションは破壊的変更ではない（カラムの追加のみ）
- 既存データへの影響なし
- NULL許可なので、既存レコードは問題なく動作
- ロールバックが必要な場合:
  ```sql
  -- manual_limitのロールバック
  ALTER TABLE profiles DROP COLUMN manual_limit;
  
  -- portal_siteのロールバック
  ALTER TABLE donations DROP COLUMN portal_site;
  ```

---

### 3. 返礼品専用フィールド（return_item）

**実装日**: 2025-01-23  
**マイグレーションファイル**: `supabase/migrations/20250123000001_add_return_item.sql`

**SQL**:
```sql
ALTER TABLE donations ADD COLUMN return_item TEXT;
COMMENT ON COLUMN donations.return_item IS '返礼品の内容（例: 和牛切り落とし 1kg、お米 10kg など）';
```

**説明**:
- 寄付テーブルに`return_item`カラムを追加
- 受け取った返礼品の内容を構造化して記録
- NULL許可（任意項目）
- 200文字制限（フロントエンド）

**影響範囲**:
- `src/types/database.types.ts` - 型定義に追加済み
- `src/lib/validations/donations.ts` - バリデーションスキーマ追加済み
- `src/components/donations/DonationForm.tsx` - 登録フォーム実装済み
- `src/components/donations/DonationEditForm.tsx` - 編集フォーム実装済み
- `src/app/actions/donations.ts` - 保存/更新処理実装済み
- `src/components/donations/DonationList.tsx` - 表示・検索機能実装済み

---

## 実行状況

- [ ] manual_limitカラム追加
- [ ] portal_siteカラム追加
- [ ] return_itemカラム追加（マイグレーションファイル作成済み）

**最終更新**: 2025-01-23
