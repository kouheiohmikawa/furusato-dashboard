# ビジネスルール・バリデーション仕様

## シミュレーション計算式（v1.0 暫定仕様）

### 基本方針
- **MVP は簡易モデル**: ざっくり目安として提供
- **将来**: 総務省資料や既存サイトの公開情報を参考に精度向上

### 計算ロジック

```typescript
function estimateLimitYen({
  annualIncome,
  hasSpouse,
  dependentsCount,
}: {
  annualIncome: number; // 円
  hasSpouse: boolean;
  dependentsCount: number;
}) {
  // 基本係数: 独身・子なし想定で 0.10（10%）
  let rate = 0.10;
  
  // 配偶者がいる場合: -0.01
  if (hasSpouse) rate -= 0.01;
  
  // 扶養家族による調整: 1人につき -0.005（最大3人まで）
  rate -= Math.min(dependentsCount, 3) * 0.005;
  
  // 下限ガード: 最低5%
  rate = Math.max(0.05, rate);
  
  // 計算
  const est = Math.round(annualIncome * rate);
  
  // 上下限クリップ: 2,000円〜500,000円
  return clamp(est, 2000, 500_000);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
```

### 安全ライン（safeLimit）
```typescript
const safeLimit = Math.round(estimatedLimit * 0.8); // 80%
```

### UI表示の注意事項
- 「目安」であることを明記
- 「他の控除がある場合は変動します」という警告を表示
- 前提条件（給与収入のみ、など）を明示

## データバリデーションルール

### 年収（annualIncome）
```typescript
annualIncome: z
  .number()
  .int()
  .min(1_000_000, "年収は100万円以上で入力してください")
  .max(30_000_000, "年収は3000万円以下で入力してください")
```
- 範囲: 1,000,000円（100万）〜 30,000,000円（3000万）

### 配偶者（hasSpouse）
```typescript
hasSpouse: z.boolean()
```

### 扶養家族数（dependentsCount）
```typescript
dependentsCount: z
  .number()
  .int()
  .min(0, "0人以上で入力してください")
  .max(10, "10人以下で入力してください")
```
- 範囲: 0〜10人

### 都道府県（prefecture）
```typescript
// src/constants/prefectures.ts
export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
] as const;

prefecture: z.enum(PREFECTURES).optional()
```

### 寄付金額（Donation.amount）
```typescript
amount: z
  .number()
  .int()
  .min(2_000, "寄付額は2,000円以上で入力してください")
  .max(1_000_000, "1件あたりの寄付額は100万円以下で入力してください")
```
- 範囲: 2,000円（自己負担額）〜 1,000,000円（100万）
- **注意**: 複数件の合計が上限を超えることは許可（警告表示のみ）

### 寄付日（Donation.donatedAt）
```typescript
donatedAt: z.date()
  .min(new Date('2008-01-01'), "2008年以降の日付を入力してください")
  .max(new Date(), "未来の日付は入力できません")
```
- ふるさと納税制度開始: 2008年

### 自治体名・返礼品名
```typescript
municipality: z.string().min(1).max(100).optional()
itemName: z.string().min(1).max(200).optional()
```

### ポータル名
```typescript
// src/constants/portals.ts
export const PORTALS = [
  "楽天ふるさと納税",
  "ふるなび",
  "さとふる",
  "ふるさとチョイス",
  "ANAのふるさと納税",
  "auPAYふるさと納税",
  "その他"
] as const;

portal: z.enum(PORTALS).optional()
```

### 寄付ステータス
```typescript
status: z.enum([
  "PENDING",           // 未処理
  "ONE_STOP_PLANNED",  // ワンストップ予定
  "ONE_STOP_SENT",     // ワンストップ送付済み
  "DECLARED",          // 確定申告済み
  "OTHER"
])
```

### URL
```typescript
url: z.string().url().optional()
```

### メモ
```typescript
memo: z.string().max(1000).optional()
```

## ビジネスルール

### 年度判定
- 寄付日の年（`donatedAt.getFullYear()`）を `year` として保存
- 1月1日〜12月31日が同一年度

### 上限超過の扱い
- 寄付合計が上限を超えても登録は**許可**
- ダッシュボードで警告表示
- 例: 「上限を ¥10,000 超過しています」

### 削除時の挙動
- 論理削除ではなく物理削除（MVP）
- 将来的に必要なら `deletedAt` を追加検討
