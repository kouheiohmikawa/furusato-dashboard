# UI/UX改善 - 2025年1月22日実装内容

## 概要

2025年1月22日に実施したUI/UX改善の詳細記録。ダッシュボードのグラフ可視性改善、手動上限額設定機能、ポータルサイトトラッキング機能の3つの大きな改善を実装。

---

## 1. ダッシュボードグラフの可視性改善 📊

### 問題点
- 円グラフが小さく見にくい（200px）
- 色が弱く、寄付状況が分かりにくい
- ラベルが不明確

### 解決策

**ファイル**: `src/components/dashboard/DonationOverview.tsx`

#### グラフの大型化
```typescript
<ResponsiveContainer width="100%" height={280}> {/* 200px → 280px */}
  <RechartsChart>
    <Pie
      innerRadius={70}
      outerRadius={110}
      // ...
    />
  </RechartsChart>
</ResponsiveContainer>
```

#### センターラベルの追加
```typescript
<Label
  content={({ viewBox }) => (
    <text x={viewBox.cx} y={viewBox.cy}>
      <tspan className="text-4xl font-bold">
        {percentage.toFixed(1)}%
      </tspan>
      <tspan className="text-sm">使用率</tspan>
    </text>
  )}
/>
```

#### 状態別カラーコーディング
```typescript
const usedColor = isOverLimit
  ? "#ef4444" // 赤色（上限超過）
  : percentage >= 80
    ? "#f59e0b" // 黄色（上限接近）
    : "#3b82f6"; // 青色（通常）
```

#### 統計カードのグラデーション
- 現在の寄付総額: `bg-gradient-to-br from-blue-50 to-blue-100/50`
- 推定上限額: `bg-gradient-to-br from-slate-50 to-slate-100/50`
- 残り枠/超過額: 状態に応じたグラデーション

**コミット**: `e173f9e` - feat: enhance dashboard chart visibility and statistics

---

## 2. 手動上限額設定機能 ⚙️

### 要件
- シミュレーション結果を上書きして手動で上限額を設定したい
- 簡単に入力できるUI
- ダッシュボードでどのソースの上限額を使っているか分かるようにする

### 実装

#### データベーススキーマ
```sql
ALTER TABLE profiles ADD COLUMN manual_limit INTEGER;
```

**型定義**: `src/types/database.types.ts`
```typescript
profiles: {
  Row: {
    id: string;
    display_name: string | null;
    prefecture: string | null;
    manual_limit: number | null; // NEW
    created_at: string;
    updated_at: string;
  };
}
```

#### プロフィール編集画面のUI強化

**ファイル**: `src/components/profile/ProfileForm.tsx`

1. **プリセットボタン**
```typescript
{[30000, 50000, 80000, 100000, 150000, 200000].map((preset) => (
  <Button
    onClick={() => setManualLimit(preset.toString())}
  >
    {(preset / 10000).toFixed(0)}万円
  </Button>
))}
```

2. **レンジスライダー**
```typescript
<input
  type="range"
  min="0"
  max="300000"
  step="10000"
  value={manualLimit || "0"}
  onChange={(e) => setManualLimit(e.target.value === "0" ? "" : e.target.value)}
/>
```

3. **増減ボタン**
```typescript
<Button onClick={() => {
  const current = parseInt(manualLimit || "0");
  setManualLimit((current + 10000).toString());
}}>+1万</Button>
```

4. **表示/送信の分離（重要なバグフィックス）**
```typescript
{/* 表示用（カンマ区切り） */}
<Input
  id="manualLimitDisplay"
  value={manualLimit ? parseInt(manualLimit).toLocaleString() : ""}
  onChange={(e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      setManualLimit(value);
    }
  }}
/>

{/* 送信用（カンマなし） */}
<input
  type="hidden"
  name="manualLimit"
  value={manualLimit || ""}
/>
```

**問題**: ユーザーが10万円と入力 → "100,000"が送信 → parseInt("100,000") = 100円
**解決**: 表示用と送信用を分離、送信用は生の数値のみ

#### 優先度ロジック

**ファイル**: `src/app/dashboard/page.tsx`
```typescript
// 優先順位: manual_limit > simulation > none
const estimatedLimit =
  profile?.manual_limit ??
  (latestSimulation
    ? (latestSimulation.result_data as { estimatedLimit?: number })?.estimatedLimit
    : undefined);

const limitSource = profile?.manual_limit
  ? "manual" as const
  : latestSimulation
    ? "simulation" as const
    : "none" as const;
```

#### ダッシュボード表示

**ファイル**: `src/components/dashboard/DonationOverview.tsx`
```typescript
{estimatedLimit && limitSource !== "none" && (
  <Badge variant="outline">
    {limitSource === "manual" ? (
      <>
        <Settings className="h-3 w-3 mr-1" />
        手動設定
      </>
    ) : (
      <>
        <TrendingUp className="h-3 w-3 mr-1" />
        シミュレーション結果
      </>
    )}
  </Badge>
)}
```

**コミット**: 
- `f9319cc` - feat: add manual donation limit setting
- `10b9b4b` - feat: improve manual limit input UX with presets and slider
- `31ad0bf` - fix: manual limit input showing wrong value

---

## 3. ポータルサイトトラッキング機能 🌐

### 要件
- どのポータルサイト（ふるさとチョイス、楽天など）で寄付したか記録したい
- ダッシュボードでポータルサイト別の統計を見たい

### 実装

#### データベーススキーマ
```sql
ALTER TABLE donations ADD COLUMN portal_site VARCHAR(100);
COMMENT ON COLUMN donations.portal_site IS 'ポータルサイト名（ふるさとチョイス、楽天など）';
```

**型定義**: `src/types/database.types.ts`
```typescript
donations: {
  Row: {
    id: string;
    user_id: string;
    municipality_name: string;
    amount: number;
    donation_date: string;
    donation_type: string | null;
    payment_method: string | null;
    portal_site: string | null; // NEW
    receipt_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

#### ポータルサイト定数

**ファイル**: `src/lib/constants/donations.ts`
```typescript
export const PORTAL_SITES = [
  "ふるさとチョイス",
  "楽天ふるさと納税",
  "さとふる",
  "ふるなび",
  "ANAのふるさと納税",
  "au PAY ふるさと納税",
  "JALふるさと納税",
  "ふるさとプレミアム",
  "その他",
] as const;

export type PortalSite = typeof PORTAL_SITES[number];
```

#### フォームの更新

**寄付登録フォーム**: `src/components/donations/DonationForm.tsx`
```typescript
const [portalSite, setPortalSite] = useState("");

// ...

<div className="space-y-2">
  <Label htmlFor="portalSite">ポータルサイト</Label>
  <Select
    name="portalSite"
    value={portalSite || undefined}
    onValueChange={setPortalSite}
  >
    <SelectTrigger>
      <SelectValue placeholder="選択してください（任意）" />
    </SelectTrigger>
    <SelectContent>
      {PORTAL_SITES.map((site) => (
        <SelectItem key={site} value={site}>
          {site}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**寄付編集フォーム**: `src/components/donations/DonationEditForm.tsx`
- 同様のポータルサイト選択フィールドを追加

#### Server Actionsの更新

**ファイル**: `src/app/actions/donations.ts`
```typescript
// createDonation
const portalSite = formData.get("portalSite") as string;

const newDonation: DonationInsert = {
  user_id: user.id,
  municipality_name: municipalityName.trim(),
  donation_date: donationDate,
  amount: Number(amount),
  donation_type: donationType || null,
  payment_method: paymentMethod || null,
  portal_site: portalSite || null, // NEW
  receipt_number: receiptNumber?.trim() || null,
  notes: notes?.trim() || null,
};

// updateDonation - 同様に追加
```

#### ダッシュボード統計の変更

**ファイル**: `src/components/dashboard/DonationOverview.tsx`

**変更前**: 支払い方法別の内訳
```typescript
const portalStats = useMemo(() => {
  // ...
  const portal = donation.payment_method || "未設定";
  // ...
}, [yearDonations]);

// タイトル
<CardTitle>支払い方法別の内訳</CardTitle>
```

**変更後**: ポータルサイト別の内訳
```typescript
const portalStats = useMemo(() => {
  // ...
  const portal = donation.portal_site || "未設定";
  // ...
}, [yearDonations]);

// タイトル
<CardTitle>ポータルサイト別の内訳</CardTitle>
```

**表示内容**:
- 各ポータルサイトごとの寄付額
- 寄付件数
- 全体に対する割合
- 順位

**コミット**: `0900c6e` - feat: add portal site tracking to donation records

---

## ビルド結果

```bash
npm run build
```

**結果**: ✅ エラー0、警告0、17ルート生成成功

---

## 必要なデータベースマイグレーション

ユーザーがSupabaseで実行する必要があるSQL:

### 1. 手動上限額設定機能
```sql
ALTER TABLE profiles ADD COLUMN manual_limit INTEGER;
```

### 2. ポータルサイトトラッキング機能
```sql
ALTER TABLE donations ADD COLUMN portal_site VARCHAR(100);
COMMENT ON COLUMN donations.portal_site IS 'ポータルサイト名（ふるさとチョイス、楽天など）';
```

---

## Gitコミット履歴

```
0900c6e (HEAD -> feature/setup-project) feat: add portal site tracking to donation records
31ad0bf fix: manual limit input showing wrong value
10b9b4b feat: improve manual limit input UX with presets and slider
f9319cc feat: add manual donation limit setting
e173f9e feat: enhance dashboard chart visibility and statistics
```

---

## 技術的なポイント

### 1. parseInt()のカンマ問題
- `parseInt("100,000")` は `100` を返す（カンマで停止）
- 解決: 表示用input（カンマあり）と送信用hidden input（カンマなし）を分離

### 2. 優先度ロジック
- Nullish coalescing operator (`??`) を使用
- `manual_limit ?? simulation ?? undefined`
- null/undefinedの場合のみ次のフォールバックを使用

### 3. 状態管理
- ReactのuseStateで複雑なフォーム状態を管理
- プリセット、スライダー、増減ボタン、直接入力が全て同じstateを更新
- 一貫性のあるUX

### 4. 型安全性
- TypeScriptの型定義を厳密に更新
- DonationInsert, DonationUpdate型に新フィールドを追加
- ビルド時の型チェックでエラーを検出

---

## ユーザーへの影響

### ダッシュボードグラフ改善
- **Before**: 小さくて見にくいグラフ
- **After**: 大きく、色分けされた分かりやすいグラフ
- **効果**: 寄付状況が一目で分かる

### 手動上限額設定
- **Before**: シミュレーション結果のみ
- **After**: 任意の上限額を簡単に設定可能
- **効果**: ユーザーの柔軟性が向上

### ポータルサイトトラッキング
- **Before**: どこで寄付したか記録できない
- **After**: ポータルサイト別の統計が見られる
- **効果**: ポイント還元などの把握が容易に
