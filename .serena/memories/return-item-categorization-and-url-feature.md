# 返礼品URL保存とカテゴリ分類機能の実装計画

**計画日**: 2025-11-24  
**実装予定**: Phase 1 実装中

---

## 📋 背景・目的

### ユーザーの要望
1. **返礼品URLの保存**: ポータルサイトの商品ページURLを保存したい
2. **将来的な活用**: URL登録データを使って人気ランキングやおすすめ機能を実装したい
3. **カテゴリ分類**: 返礼品を体系的に分類し、データの価値を高めたい

### 議論のポイント
- URL自動入力機能（スクレイピング）は法的・技術的リスクが高いため見送り
- URLの保存のみに絞り、将来的なランキング・おすすめ機能の基盤とする
- 返礼品カテゴリを構造化することで、統計分析とランキングの質を向上

---

## 🎯 実現する機能（Phase 1）

### 1. URL保存機能
- 寄付記録に商品ページURLを保存
- URLから自動的にポータルサイトを判定
- 一覧画面でリンクを表示

### 2. 返礼品カテゴリ分類
- 大カテゴリ（肉類、魚介類、家電など）10-15個
- 小カテゴリ（牛肉、サーモン、掃除機など）80-150個
- 複数カテゴリの選択可能（多対多関係）
- フリーテキストの返礼品名も併用

---

## ⚖️ 法的検討

### スクレイピング（自動取得）
**結論**: ❌ 実装しない

**理由**:
- 各サイトの利用規約違反の可能性
- HTML構造変更によるメンテナンスコスト
- 9つのポータルサイト全てに個別対応が必要

### URL集計とランキング
**結論**: ✅ 法的に問題なし

**根拠**:
- URLは単なる文字列（著作物ではない）
- ユーザーが自発的に登録したデータの集計
- 類似例: Amazon「よく一緒に購入される商品」、価格.com人気ランキング

**注意事項**:
- 個人を特定できる情報は非表示
- 「○○人が選びました」のように匿名化
- 最低表示件数を設定（例: 5人以上）
- プライバシーポリシーに統計利用を明記

---

## 🏗️ データ設計

### 採用: Option A（多対多関係）

**理由**:
- 1つの返礼品が複数カテゴリに属する場合に対応
- 例: 「焼肉セット」= 牛肉 + 豚肉 + 調味料
- クエリ性能が高い
- 型安全性が高い
- 将来の拡張性が高い

### データベーススキーマ

#### 1. donationsテーブルへの追加
```sql
ALTER TABLE donations ADD COLUMN product_url TEXT;
COMMENT ON COLUMN donations.product_url IS '返礼品の商品ページURL';
```

#### 2. カテゴリマスタ（大分類）
```sql
CREATE TABLE return_item_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. サブカテゴリマスタ（小分類）
```sql
CREATE TABLE return_item_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES return_item_categories(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);
```

#### 4. 中間テーブル（多対多）
```sql
CREATE TABLE donation_return_item_tags (
  id SERIAL PRIMARY KEY,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES return_item_subcategories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(donation_id, subcategory_id)
);
```

---

## 🎨 カテゴリ設計

### 大カテゴリ（14個）

| ID | 名称 | slug | アイコン |
|----|------|------|---------|
| 1 | 肉類 | meat | beef |
| 2 | 魚介類 | seafood | fish |
| 3 | 米・パン | grain | wheat |
| 4 | 果物 | fruit | apple |
| 5 | 野菜 | vegetable | carrot |
| 6 | 加工食品 | processed | package |
| 7 | 飲料・酒 | beverage | wine |
| 8 | お菓子 | sweets | candy |
| 9 | 調味料 | seasoning | spoon |
| 10 | 日用品 | daily | shopping-bag |
| 11 | 家電 | appliance | plug |
| 12 | 工芸品 | craft | palette |
| 13 | 旅行・体験 | experience | plane |
| 14 | その他 | other | more-horizontal |

### 小カテゴリ（主要なもの）

#### 肉類（8個）
- 牛肉、豚肉、鶏肉、ラム・マトン、ハンバーグ、ソーセージ・ハム、焼肉・BBQセット、その他肉類

#### 魚介類（9個）
- サーモン・鮭、マグロ、カニ、エビ、ホタテ、イクラ・魚卵、うなぎ、干物・加工品、その他魚介類

#### 家電（8個）
- 掃除機、空気清浄機、炊飯器、電子レンジ、冷蔵庫、洗濯機、テレビ、その他家電

（他カテゴリも同様に5-15個の小カテゴリを定義）

**総数**: 約80-150個の小カテゴリ

---

## 🎨 UI/UX設計

### 採用: 案1（2段階セレクト + チェックボックス）

**フォーム構成**:
```
┌─────────────────────────────────────┐
│ 商品ページURL（任意）               │
│ [https://www.satofull.jp/...   ]   │
│ ↓ URLから自動判定                   │
│ ポータルサイト: [さとふる ▼]       │
│                                     │
│ 返礼品のカテゴリ *必須              │
│ 大カテゴリ: [肉類 ▼]               │
│                                     │
│ 該当する項目を選択（複数可）：      │
│ ☑ 牛肉                              │
│ ☐ 豚肉                              │
│ ☐ 鶏肉                              │
│ ☐ ハンバーグ                        │
│ ... もっと見る                      │
│                                     │
│ 返礼品名（任意）:                   │
│ [和牛切り落とし 1kg            ]   │
└─────────────────────────────────────┘
```

**機能**:
- URLからポータルサイトを自動判定
- 大カテゴリ選択で小カテゴリが動的に変わる
- 複数の小カテゴリ選択可能
- フリーテキストの返礼品名は任意

### 一覧画面の表示

**商品ページURLがある場合**:
```
和牛切り落とし 1kg
[牛肉] [肉類]
└─ [🔗 商品ページを見る] ← 新しいタブで開く
```

---

## 🔧 実装計画

### Phase 1: 基本機能（今回実装）

**実装時間**: 3-4時間

#### 1. データベースマイグレーション（30分）
- [ ] product_url カラム追加
- [ ] return_item_categories テーブル作成
- [ ] return_item_subcategories テーブル作成
- [ ] donation_return_item_tags テーブル作成
- [ ] マスタデータ投入（14大カテゴリ + 80-150小カテゴリ）

#### 2. 型定義の更新（15分）
- [ ] database.types.ts の更新
- [ ] 新しいテーブルの型定義

#### 3. バリデーションスキーマ（20分）
- [ ] product_url のバリデーション（URL形式、最大2000文字）
- [ ] 返礼品カテゴリの必須チェック
- [ ] 最低1つの小カテゴリ選択を必須化

#### 4. フォームUI（1.5時間）
- [ ] DonationForm: URL入力欄、カテゴリ選択UI
- [ ] DonationEditForm: 同様の変更
- [ ] ポータルサイト自動判定ロジック
- [ ] 大カテゴリ選択で小カテゴリを動的表示
- [ ] チェックボックスで複数選択

#### 5. Server Actions（30分）
- [ ] createDonation: URL・カテゴリ保存
- [ ] updateDonation: 同様の変更
- [ ] URLからポータルサイト判定の関数

#### 6. 一覧画面（30分）
- [ ] DonationList: 商品ページリンク表示
- [ ] カテゴリバッジ表示
- [ ] カテゴリフィルター（オプション）

#### 7. テスト・調整（30分）
- [ ] 動作確認
- [ ] UI調整
- [ ] エラーハンドリング

### Phase 2: ランキング・統計機能（後日実装）

**実装時期**: ユーザー数が増えてから（目安: 50-100人以上）

#### 実装予定機能
- [ ] カテゴリ別人気ランキングページ
- [ ] URL別登録回数の集計
- [ ] 「○○人が選びました」表示
- [ ] 統計ダッシュボード（管理者向け）

#### 実装予定内容
```sql
-- 人気ランキングクエリ例
SELECT 
  d.product_url,
  d.return_item,
  s.name as subcategory_name,
  COUNT(*) as count
FROM donations d
JOIN donation_return_item_tags t ON d.id = t.donation_id
JOIN return_item_subcategories s ON t.subcategory_id = s.id
WHERE d.product_url IS NOT NULL
  AND s.slug = 'beef'  -- 牛肉カテゴリ
GROUP BY d.product_url, d.return_item, s.name
HAVING COUNT(*) >= 5  -- 最低5人以上
ORDER BY count DESC
LIMIT 10;
```

### Phase 3: おすすめ機能（将来）

**実装時期**: Phase 2の後、データが十分蓄積されてから

#### 実装予定機能
- [ ] 協調フィルタリング
- [ ] 「この自治体に寄付した人は...」
- [ ] カテゴリベースのレコメンド
- [ ] ユーザー嗜好分析

---

## 📊 期待される効果

### ユーザー体験
- ✅ 商品ページにすぐアクセスできる
- ✅ 返礼品を探しやすくなる（カテゴリフィルター）
- ✅ 人気商品を参考にできる（将来）
- ✅ 自分の嗜好を把握できる

### データの価値
- ✅ URL登録数の集計が可能
- ✅ カテゴリ別の統計分析が可能
- ✅ ランキング機能の基盤
- ✅ おすすめ機能の基盤

### ビジネス
- ✅ 差別化要素（他アプリにない機能）
- ✅ データが集まるほど価値が上がる（ネットワーク効果）
- ✅ アフィリエイト化の可能性
- ✅ ポータルサイトとの提携材料

---

## 🔐 プライバシー・セキュリティ対策

### 実装時の配慮事項

#### 1. URL正規化
クエリパラメータを削除して同じ商品を統一
```typescript
function normalizeUrl(url: string): string {
  const urlObj = new URL(url);
  return `${urlObj.origin}${urlObj.pathname}`;
}
```

#### 2. 匿名化
ランキング表示時は個人を特定できないように
```typescript
if (count < 5) {
  return null;  // 5人未満は表示しない
}
```

#### 3. プライバシーポリシー更新
```
■ 統計情報の利用
お客様が登録した返礼品URLとカテゴリは、個人を特定できない形で
統計処理され、人気ランキングやおすすめ機能に利用されます。
```

---

## 📁 実装ファイル一覧

### 新規作成
- `supabase/migrations/20250124000002_add_return_item_categorization.sql`
- `src/lib/constants/returnItemCategories.ts`
- `src/lib/utils/urlUtils.ts`（URL正規化・ポータルサイト判定）

### 変更
- `src/types/database.types.ts`
- `src/lib/validations/donations.ts`
- `src/components/donations/DonationForm.tsx`
- `src/components/donations/DonationEditForm.tsx`
- `src/app/actions/donations.ts`
- `src/components/donations/DonationList.tsx`
- `src/app/privacy/page.tsx`（プライバシーポリシー更新）

---

## 🎯 成功指標（Phase 2以降）

### データ蓄積
- URL登録率: 50%以上
- カテゴリ登録率: 100%（必須化）
- 登録件数: 100件以上でランキング公開

### ユーザー行動
- ランキングページの閲覧数
- 商品ページリンクのクリック率
- カテゴリフィルターの使用率

### ビジネス
- ユーザー満足度の向上
- 滞在時間の増加
- 再訪率の向上

---

## 🚨 既知の制約・課題

### 技術的制約
- スクレイピングは実装しない（法的・技術的リスク）
- 初期はランキングデータが少ない
- 商品ページのリンク切れ対応が必要

### 運用上の課題
- カテゴリマスタの定期メンテナンス
- 新しいカテゴリの追加要望への対応
- ユーザーからのカテゴリ修正要望

---

## 📝 次のステップ

### Phase 1実装（今回）
1. マイグレーションファイル作成
2. マスタデータ投入
3. フォームUI実装
4. Server Actions更新
5. 一覧画面更新
6. テスト・デプロイ

### Phase 2準備（将来）
- ユーザーフィードバック収集
- データ蓄積状況の確認
- ランキングページの設計

---

**最終更新**: 2025-11-24  
**実装ステータス**: Phase 1 実装準備完了
