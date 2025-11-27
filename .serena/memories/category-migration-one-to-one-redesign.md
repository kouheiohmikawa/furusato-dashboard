# 返礼品カテゴリ機能：多対多から一対一への設計変更

**変更日**: 2025-01-26  
**理由**: ユーザー体験とデータの一貫性向上  
**ステータス**: マイグレーション修正完了、コード修正待ち

---

## 📋 設計変更の背景

### 変更前の設計（多対多）
- 1つの寄付に複数のカテゴリを選択可能
- 中間テーブル `donation_return_item_tags` で関連付け
- チェックボックスで複数選択UI

### 変更の理由

#### 1. **ポータルサイトとの整合性**
- 楽天ふるさと納税、さとふる、ふるさとチョイスは全て **1商品 = 1カテゴリ**
- ユーザーは既にこのUXに慣れている
- 統一されたUXを提供すべき

#### 2. **データの一貫性**
- 多対多の場合、ユーザーによって選択数が異なる
  - Aさん：「和牛」→ 牛肉のみ
  - Bさん：「和牛」→ 牛肉 + 肉類 + 焼肉セットの3つ
- ランキング機能（Phase 2）で統計がブレる
- データの信頼性が低下

#### 3. **シンプルさ**
- フォームがシンプルになる
- 「いくつ選べばいいの？」という迷いがなくなる
- 実装も単純になる

### セット商品の対応
- 「焼肉セット（牛肉+豚肉+鶏肉）」→ **メインの食材を選択**
- サブカテゴリに「焼肉セット」「海鮮セット」などを用意

---

## 🔧 変更内容

### データベース設計

#### Before（多対多）
```
donations
├── id
├── product_url
└── return_item

donation_return_item_tags（中間テーブル）
├── donation_id → donations.id
└── subcategory_id → return_item_subcategories.id
```

#### After（一対一）
```
donations
├── id
├── product_url
├── subcategory_id → return_item_subcategories.id
└── return_item
```

### マイグレーションファイル

**ファイル**: `supabase/migrations/20250124000002_add_return_item_categorization.sql`

**主な変更点**:
- ❌ `donation_return_item_tags` テーブル削除
- ✅ `donations.subcategory_id` カラム追加（INTEGER, FOREIGN KEY）
- ✅ インデックス追加（`idx_donations_subcategory_id`）
- ✅ カテゴリマスタ（14件）+ サブカテゴリマスタ（95件）は変更なし

**削除されたセクション**:
- 中間テーブルの作成（旧: 56-72行）
- 中間テーブルのRLSポリシー（旧: 304-337行）

**追加されたセクション**:
```sql
-- donations.subcategory_idカラムを追加
IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'donations' AND column_name = 'subcategory_id'
) THEN
  ALTER TABLE donations ADD COLUMN subcategory_id INTEGER REFERENCES return_item_subcategories(id);
  COMMENT ON COLUMN donations.subcategory_id IS '返礼品のサブカテゴリID';
END IF;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_donations_subcategory_id ON donations(subcategory_id);
```

---

## 📂 削除されたファイル

1. **`supabase/migrations/20250125000001_add_donation_url.sql`**
   - `donation_url` カラムは不要（`product_url` のみ使用）
   - 削除済み

---

## 🔄 dev環境でのマイグレーション手順

### ステップ1: クリーンアップSQL実行

**Supabase Dashboard（dev環境）** → SQL Editor:

```sql
-- 中間テーブルを削除
DROP TABLE IF EXISTS donation_return_item_tags CASCADE;

-- donations.product_urlカラムを削除（再作成）
ALTER TABLE donations DROP COLUMN IF EXISTS product_url;

-- donations.subcategory_idカラムを削除（存在する場合）
ALTER TABLE donations DROP COLUMN IF EXISTS subcategory_id;
```

### ステップ2: 新しいマイグレーション実行

同じSQL Editorで、以下のファイル内容を実行：
```
supabase/migrations/20250124000002_add_return_item_categorization.sql
```

### ステップ3: 確認

Table Editorで確認：
- ❌ `donation_return_item_tags` テーブルが削除されている
- ✅ `donations.subcategory_id` カラムが追加されている
- ✅ `donations.product_url` カラムがある

---

## 📝 今後の実装作業（未完了）

### 1. TypeScript型定義更新

**ファイル**: `src/types/database.types.ts`

**削除**:
```typescript
export type DonationReturnItemTag = Tables<'donation_return_item_tags'>;
export type DonationWithCategories = Donation & { ... };
```

**追加**:
```typescript
donations: {
  Row: {
    // ... 既存フィールド
    subcategory_id: number | null;
  };
  Insert: {
    // ... 既存フィールド
    subcategory_id?: number | null;
  };
  Update: {
    // ... 既存フィールド
    subcategory_id?: number | null;
  };
}
```

---

### 2. バリデーションスキーマ更新

**ファイル**: `src/lib/validations/donations.ts`

**変更前**:
```typescript
export const subcategoryIdsSchema = z
  .array(z.number().int().positive())
  .min(1, "少なくとも1つのカテゴリを選択してください")
  .max(10, "カテゴリは最大10個まで選択できます")
  .optional();
```

**変更後**:
```typescript
export const subcategoryIdSchema = z
  .number({ message: "カテゴリを選択してください" })
  .int()
  .positive()
  .nullable()
  .optional();
```

**スキーマ更新**:
```typescript
export const createDonationSchema = z.object({
  // ... 既存フィールド
  productUrl: productUrlSchema,
  subcategoryId: subcategoryIdSchema,  // 変更
});
```

---

### 3. DonationForm更新（新規登録）

**ファイル**: `src/components/donations/DonationForm.tsx`

**UI変更**:
- ❌ チェックボックスで複数選択
- ✅ Selectで単一選択

**削除**:
```typescript
const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
```

**追加**:
```typescript
const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
```

**フォーム送信**:
```typescript
// 変更前
selectedSubcategories.forEach((subcatId) => {
  formData.append("subcategoryIds", subcatId.toString());
});

// 変更後
formData.append("subcategoryId", selectedSubcategoryId);
```

**UIコンポーネント**:
```tsx
<Select
  value={selectedSubcategoryId}
  onValueChange={setSelectedSubcategoryId}
>
  <SelectTrigger>
    <SelectValue placeholder="カテゴリを選択" />
  </SelectTrigger>
  <SelectContent>
    {availableSubcategories.map((subcat) => (
      <SelectItem key={subcat.id} value={subcat.id.toString()}>
        {subcat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 4. DonationEditForm更新（編集）

**ファイル**: `src/components/donations/DonationEditForm.tsx`

**変更内容**:
- `existingSubcategoryIds` プロップ → `existingSubcategoryId` プロップ
- 複数選択 → 単一選択
- 初期値の設定方法を変更

**Before**:
```typescript
type DonationEditFormProps = {
  donation: Donation;
  existingSubcategoryIds?: number[];
};
```

**After**:
```typescript
type DonationEditFormProps = {
  donation: Donation;
  existingSubcategoryId?: number | null;
};
```

---

### 5. Server Actions更新

**ファイル**: `src/app/actions/donations.ts`

#### createDonation

**変更前**:
```typescript
const subcategoryIds = formData.getAll("subcategoryIds")
  .map(id => parseInt(id as string))
  .filter(id => !isNaN(id));

// 寄付作成後
const tags = validatedSubcategoryIds.map(subcategoryId => ({
  donation_id: insertedDonation.id,
  subcategory_id: subcategoryId,
}));
await supabase.from("donation_return_item_tags").insert(tags);
```

**変更後**:
```typescript
const subcategoryId = formData.get("subcategoryId") as string | null;
const parsedSubcategoryId = subcategoryId ? parseInt(subcategoryId) : null;

// バリデーション
const validationResult = createDonationSchema.safeParse({
  // ... 既存フィールド
  subcategoryId: parsedSubcategoryId,
});

// 寄付作成時
const newDonation: DonationInsert = {
  // ... 既存フィールド
  subcategory_id: validatedData.subcategoryId,
};

await supabase.from("donations").insert(newDonation);
// 中間テーブルへのinsertは不要
```

#### updateDonation

**変更前**:
```typescript
// 既存のタグを削除
await supabase.from("donation_return_item_tags").delete().eq("donation_id", id);

// 新しいタグを挿入
const tags = validatedSubcategoryIds.map(...);
await supabase.from("donation_return_item_tags").insert(tags);
```

**変更後**:
```typescript
const updateData: DonationUpdate = {
  // ... 既存フィールド
  subcategory_id: validatedData.subcategoryId,
};

await supabase.from("donations").update(updateData).eq("id", id);
// タグテーブルの操作は不要
```

---

### 6. DonationList更新（一覧表示）

**ファイル**: `src/components/donations/DonationList.tsx`

**データ取得の変更**:

**変更前**:
```typescript
.select(`
  *,
  donation_return_item_tags (
    subcategory_id,
    return_item_subcategories (
      id, name, slug, category_id,
      return_item_categories (
        id, name, slug
      )
    )
  )
`)
```

**変更後**:
```typescript
.select(`
  *,
  return_item_subcategories (
    id,
    name,
    slug,
    return_item_categories (
      id,
      name,
      slug
    )
  )
`)
```

**型定義の変更**:

**変更前**:
```typescript
type DonationWithCategories = Donation & {
  donation_return_item_tags?: Array<{...}>;
};
```

**変更後**:
```typescript
type DonationWithCategory = Donation & {
  return_item_subcategories?: {
    id: number;
    name: string;
    slug: string;
    return_item_categories: {
      id: number;
      name: string;
      slug: string;
    } | null;
  } | null;
};
```

**表示の変更**:

**変更前**:
```tsx
{donation.donation_return_item_tags?.map((tag) => (
  <Badge key={tag.subcategory_id}>
    {tag.return_item_subcategories?.name}
  </Badge>
))}
```

**変更後**:
```tsx
{donation.return_item_subcategories && (
  <Badge>
    {donation.return_item_subcategories.name}
  </Badge>
)}
```

---

### 7. データ取得側の更新

**ファイル**: `src/app/dashboard/donations/page.tsx`

**クエリの変更**:
```typescript
const { data: donations } = await supabase
  .from("donations")
  .select(`
    *,
    return_item_subcategories (
      id,
      name,
      slug,
      return_item_categories (
        id,
        name,
        slug
      )
    )
  `)
  .eq("user_id", user.id)
  .order("donation_date", { ascending: false });
```

---

## ✅ 完了したタスク

- [x] 設計変更の決定（多対多 → 一対一）
- [x] マイグレーションファイル修正
- [x] 不要なマイグレーションファイル削除
- [x] クリーンアップSQLスクリプト作成

---

## ⏳ 残りのタスク

- [ ] dev環境でクリーンアップSQL実行
- [ ] dev環境で新しいマイグレーション実行
- [ ] TypeScript型定義更新
- [ ] バリデーションスキーマ更新
- [ ] DonationForm更新（単一選択UI）
- [ ] DonationEditForm更新
- [ ] Server Actions更新（create/update）
- [ ] DonationList更新（カテゴリ表示）
- [ ] データ取得クエリ更新
- [ ] ローカルでビルド確認
- [ ] dev環境で動作確認
- [ ] prd環境へのマイグレーション適用

---

## 📊 期待される効果

### Before（多対多）
- ❌ ユーザーが迷う（いくつ選べばいい？）
- ❌ 人によって選び方が異なる
- ❌ 統計データが不正確
- ❌ 複雑な実装

### After（一対一）
- ✅ シンプルで迷わない
- ✅ 全員が同じ基準で選択
- ✅ 統計データが正確
- ✅ ポータルサイトと同じUX
- ✅ 実装が単純

---

## 🔍 注意点

### セット商品の扱い
- 「焼肉セット（牛肉+豚肉+鶏肉）」の場合
  - → 「焼肉セット」カテゴリを選択（肉類 > 焼肉セット）
  - または「牛肉」などメインの食材を選択
  - ユーザーの自由に任せる

### 既存データへの影響
- 既存の寄付データには `subcategory_id` が NULL
- 編集時に選択を促すメッセージ表示
- 必須入力にはしない（後方互換性）

---

**最終更新**: 2025-01-26  
**次のステップ**: dev環境でマイグレーション再実行後、コード修正に着手
