# 返礼品カテゴリ設計の一対一への変更作業

## 作業日
2025-01-26

## 作業の背景と目的

### 背景
- 当初、返礼品カテゴリは多対多の関係で実装されていた（1つの寄付に複数のカテゴリを紐付け可能）
- `donation_return_item_tags`中間テーブルを使用した設計

### 変更の理由
1. **実際のポータルサイトとの整合性**: 楽天ふるさと納税やさとふるなどの主要サイトは一対一の関係（1つの返礼品に1つのカテゴリ）
2. **UXのシンプル化**: ユーザーにとって分かりやすく、入力が簡単
3. **統計の正確性**: 重複カウントを避け、より正確な集計が可能
4. **データの一貫性**: 実態に即したシンプルなデータモデル

## 実施した変更内容

### 1. データベース設計の変更

#### マイグレーションファイルの修正
**ファイル**: `supabase/migrations/20250124000002_add_return_item_categorization.sql`

**変更内容**:
- `donation_return_item_tags`中間テーブルの作成を削除
- `donations`テーブルに`subcategory_id`カラムを直接追加
  ```sql
  ALTER TABLE donations ADD COLUMN subcategory_id INTEGER 
    REFERENCES return_item_subcategories(id);
  CREATE INDEX idx_donations_subcategory_id ON donations(subcategory_id);
  ```
- 中間テーブル用のRLSポリシーを削除

#### クリーンアップスクリプト
**ファイル**: `supabase/migrations/cleanup_for_one_to_one.sql`

dev環境で既存の中間テーブルとポリシーを安全に削除するスクリプトを作成:
```sql
DROP TABLE IF EXISTS donation_return_item_tags CASCADE;
ALTER TABLE donations DROP COLUMN IF EXISTS product_url;
ALTER TABLE donations DROP COLUMN IF EXISTS subcategory_id;
```

### 2. TypeScript型定義の更新

**ファイル**: `src/types/database.types.ts`

**変更箇所**:
- Line 60: `donations.Row`に`subcategory_id: number | null`を追加
- Line 79: `donations.Insert`に`subcategory_id?: number | null`を追加
- Line 98: `donations.Update`に`subcategory_id?: number | null`を追加
- Line 188-207: `donation_return_item_tags`テーブル定義を削除
- Line 261-270: 関連する型エイリアスを削除
- Line 272-285: `DonationWithCategories`を`DonationWithCategory`（単数形）に変更し、一対一のリレーション型に更新

### 3. バリデーションスキーマの変更

**ファイル**: `src/lib/validations/donations.ts`

**変更箇所**:
- Line 148-157: `productUrlSchema`を追加（商品URL用）
- Line 160-169: `subcategoryIdsSchema`（配列）を`subcategoryIdSchema`（単一値）に変更
  - 配列バリデーションから単一の数値バリデーションに変更
  - `.nullable().optional()`を追加
- Line 174-187: `createDonationSchema`を更新
  - `subcategoryIds`を`subcategoryId`に変更
  - `productUrl`フィールドを追加

### 4. フォームUIの変更

#### DonationForm（新規登録フォーム）
**ファイル**: `src/components/donations/DonationForm.tsx`

**主な変更**:
- Line 17: `Checkbox`コンポーネントのimportを削除
- Line 40-41: 状態管理を`selectedSubcategories: number[]`から`selectedSubcategoryId: string`に変更
- Line 49-54: カテゴリ変更時のリセットロジックを単一値に対応
- Line 77-79: フォーム送信時に単一の`subcategoryId`を追加
- Line 96: リセット時に`selectedSubcategoryId`をクリア
- Line 418-441: チェックボックスグリッドをSelectドロップダウンに変更
  ```tsx
  <Select
    value={selectedSubcategoryId}
    onValueChange={setSelectedSubcategoryId}
    disabled={isLoading}
  >
    <SelectTrigger>
      <SelectValue placeholder="小カテゴリを選択してください" />
    </SelectTrigger>
    <SelectContent>
      {availableSubcategories.map((subcategory) => (
        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
          {subcategory.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  ```

#### DonationEditForm（編集フォーム）
**ファイル**: `src/components/donations/DonationEditForm.tsx`

**主な変更**:
- Line 16: `Checkbox`のimportを削除
- Line 31-33: Props型を`existingSubcategoryIds?: number[]`から`existingSubcategoryId?: number | null`に変更
- Line 46-48: 状態管理を単一値に変更
- Line 52-59: 初期値設定ロジックを一対一に対応
- Line 92-94: フォーム送信時の処理を単一値に変更
- Line 118-132: `toggleSubcategory`関数を削除
- Line 418-441: UIをSelectドロップダウンに変更（DonationFormと同様）

### 5. Server Actionsの修正

**ファイル**: `src/app/actions/donations.ts`

#### createDonation関数
**変更箇所**:
- Line 31-33: サブカテゴリIDの取得を配列から単一値に変更
  ```typescript
  const subcategoryIdStr = getFormValue(formData, "subcategoryId");
  const subcategoryId = subcategoryIdStr ? parseInt(subcategoryIdStr) : null;
  ```
- Line 47: バリデーションで`subcategoryId`を使用
- Line 67: 分割代入で`subcategoryId`を取得
- Line 85: `donations`レコードに`subcategory_id`を直接設定
- Line 89-95: 中間テーブルへの挿入処理を削除

#### updateDonation関数
**変更箇所**:
- Line 123-125: サブカテゴリIDの取得を単一値に変更
- Line 139: バリデーションで`subcategoryId`を使用
- Line 159: 分割代入で`subcategoryId`を取得
- Line 176: `donations`レコードに`subcategory_id`を直接設定
- Line 180-186: 中間テーブルの削除・挿入処理を削除

### 6. 一覧表示・編集ページの修正

#### DonationList（一覧表示コンポーネント）
**ファイル**: `src/components/donations/DonationList.tsx`

**変更箇所**:
- Line 29: Props型を`DonationWithCategories[]`から`DonationWithCategory[]`に変更
- Line 264: 条件を`donation.donation_return_item_tags`から`donation.return_item_subcategories`に変更
- Line 278-290: カテゴリ表示を配列mapから単一Badgeに変更
  ```tsx
  {donation.return_item_subcategories && (
    <div className="flex items-start gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1.5">
        <Tag className="h-3 w-3 inline mr-1" />
        カテゴリ
      </span>
      <Badge variant="secondary" className="...">
        {donation.return_item_subcategories.name}
      </Badge>
    </div>
  )}
  ```
- Line 323-330: `donation_url`ボタンを削除

#### 一覧ページ
**ファイル**: `src/app/dashboard/donations/page.tsx`

**変更箇所**:
- Line 8: Import型を`DonationWithCategories`から`DonationWithCategory`に変更
- Line 23-40: データ取得クエリを一対一JOINに変更
  ```typescript
  .select(`
    *,
    return_item_subcategories (
      id,
      name,
      slug,
      category_id,
      return_item_categories (
        id,
        name,
        slug
      )
    )
  `)
  ```
- Line 84: 型キャストを`DonationWithCategory[]`に変更

#### 編集ページ
**ファイル**: `src/app/dashboard/donations/[id]/edit/page.tsx`

**変更箇所**:
- Line 80: `DonationEditForm`に`existingSubcategoryId={donation.subcategory_id}`を渡すように変更

## 実行手順

### dev環境での実行
1. クリーンアップスクリプトを実行
   ```sql
   -- supabase/migrations/cleanup_for_one_to_one.sql
   ```
2. 修正したマイグレーションを実行
   ```sql
   -- supabase/migrations/20250124000002_add_return_item_categorization.sql
   ```

### 確認結果
- ✅ 3つのテーブルが正常に作成された
  - `return_item_categories`: 14件のデータ
  - `return_item_subcategories`: 14件のデータ  
  - `donations.subcategory_id`: カラム追加成功
- ✅ ローカルビルド成功（型エラーなし）

## 変更ファイル一覧

### データベース関連
- `supabase/migrations/20250124000002_add_return_item_categorization.sql` (修正)
- `supabase/migrations/cleanup_for_one_to_one.sql` (新規作成)

### TypeScript型定義
- `src/types/database.types.ts` (修正)

### バリデーション
- `src/lib/validations/donations.ts` (修正)

### フォームコンポーネント
- `src/components/donations/DonationForm.tsx` (修正)
- `src/components/donations/DonationEditForm.tsx` (修正)

### Server Actions
- `src/app/actions/donations.ts` (修正)

### ページコンポーネント
- `src/components/donations/DonationList.tsx` (修正)
- `src/app/dashboard/donations/page.tsx` (修正)
- `src/app/dashboard/donations/[id]/edit/page.tsx` (修正)

## 次のステップ

### 1. dev環境での動作確認
- [ ] 寄付の新規登録（カテゴリの単一選択）
- [ ] 寄付の編集（既存カテゴリの表示と変更）
- [ ] 一覧表示（カテゴリの単一Badge表示）

### 2. 本番環境への適用準備
- [ ] コミット＆プッシュ
- [ ] 本番環境でクリーンアップスクリプト実行
- [ ] 本番環境でマイグレーション実行
- [ ] 本番環境での動作確認

## 技術的なポイント

### データモデルの変更
```
【変更前】多対多
donations ←→ donation_return_item_tags ←→ return_item_subcategories

【変更後】一対一
donations → return_item_subcategories
```

### UIの変更
```
【変更前】
- 複数選択チェックボックス
- 最大10個まで選択可能
- 選択数の表示

【変更後】
- 単一選択Selectドロップダウン
- 1つのみ選択可能
- シンプルで分かりやすいUI
```

### データ取得の変更
```typescript
// 変更前: 中間テーブル経由
donation_return_item_tags (
  subcategory_id,
  return_item_subcategories (...)
)

// 変更後: 直接JOIN
return_item_subcategories (
  id,
  name,
  slug,
  ...
)
```

## 関連ドキュメント
- `return-item-categorization-phase1-implementation.md` - 初期実装（多対多設計）
- `return-item-categorization-and-url-feature.md` - カテゴリ機能とURL機能の説明
