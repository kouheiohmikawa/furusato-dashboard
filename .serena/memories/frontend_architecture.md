# フロントエンドアーキテクチャ設計（確定版）

## アーキテクチャ方針

**Next.js App Router × FSD（Feature-Sliced Design）ハイブリッド構成**

- Next.js の標準構成を尊重
- FSD の「機能別分割」の良さを取り入れ
- Server Components/Actions を最大限活用
- 個人開発で過剰にならない範囲

## ディレクトリ構成

```
src/
  app/                        # Next.js App Router（ルーティング）
    layout.tsx
    page.tsx                  # ランディング
    
    (public)/                 # 非ログイン向けルート
      simulator/
        page.tsx              # Server Component
    
    (protected)/              # ログイン必須ルート
      dashboard/
        page.tsx              # Server Component
        actions.ts            # Server Actions
      donations/
        page.tsx
        new/page.tsx
        actions.ts
      profile/
        page.tsx
        actions.ts
    
    (auth)/                   # 認証関連
      login/page.tsx
      signup/page.tsx
    
    api/                      # API Routes（必要最小限）
      simulate/simple/route.ts
      auth/[...nextauth]/route.ts
    
    error.tsx
    not-found.tsx
  
  features/                   # 機能別モジュール
    auth/
      ui/
        LoginForm.tsx
        SignupForm.tsx
      lib/
        authSchema.ts
        validateCredentials.ts
    
    simulator/
      ui/
        SimulatorForm.tsx
        SimulatorResult.tsx
      lib/
        calculateLimit.ts     # ビジネスロジック
        simulatorSchema.ts    # Zod
    
    donations/
      ui/
        DonationTable.tsx
        DonationForm.tsx
        DonationFilters.tsx
      lib/
        donationSchema.ts
        formatDonation.ts
    
    dashboard/
      ui/
        SummaryCards.tsx
        RecentDonations.tsx
      lib/
        calculateSummary.ts
    
    profile/
      ui/
        ProfileForm.tsx
      lib/
        profileSchema.ts
  
  entities/                   # ドメインモデル
    user/
      model.ts                # User型、型拡張
      lib.ts                  # ユーティリティ
    
    donation/
      model.ts                # Donation型、ステータス定義
      lib.ts                  # 集計ロジック
    
    profile/
      model.ts                # Profile型
  
  shared/                     # 共通レイヤー
    ui/                       # shadcn/ui コンポーネント
      button.tsx
      input.tsx
      card.tsx
      form.tsx
      select.tsx
      dialog.tsx
      ...
    
    lib/
      prisma.ts               # Prisma Client
      auth.ts                 # Auth.js設定
      rate-limit.ts
      fetcher.ts
      formatters.ts
    
    config/
      constants.ts
      prefectures.ts
      portals.ts
  
  types/
    index.ts                  # 共通型定義
```

## レイヤー別の役割

### app/
**責務**: ルーティング、レイアウト、Server Actions

- ページ構成とルーティングのみ
- Server Component でデータ取得（Prisma直接）
- Server Actions で書き込み処理
- できるだけロジックを書かない

```typescript
// app/simulator/page.tsx
import { SimulatorForm } from '@/features/simulator/ui/SimulatorForm';

export default function SimulatorPage() {
  return (
    <div>
      <h1>控除額シミュレーション</h1>
      <SimulatorForm />
    </div>
  );
}
```

### features/
**責務**: 機能ごとの完結したモジュール

- `ui/`: Reactコンポーネント（Server/Client両方）
- `lib/`: ビジネスロジック、Zodスキーマ、ヘルパー関数

**重要**: api/ や model/ は作らない
- データ取得 → Server Component or Server Actions
- 状態管理 → React Hook Form or useState

```typescript
// features/simulator/lib/calculateLimit.ts
export function estimateLimitYen(params: SimulationInput): number {
  let rate = 0.10;
  if (params.hasSpouse) rate -= 0.01;
  rate -= Math.min(params.dependentsCount, 3) * 0.005;
  rate = Math.max(0.05, rate);
  return Math.round(params.annualIncome * rate);
}

// features/simulator/ui/SimulatorForm.tsx
"use client"
import { useForm } from 'react-hook-form';
import { estimateLimitYen } from '../lib/calculateLimit';

export function SimulatorForm() {
  // React Hook Form + ロジック呼び出し
}
```

### entities/
**責務**: ドメイン固有の型と共通処理

- Prisma型の拡張
- ドメインオブジェクトのユーティリティ
- enum、定数定義

```typescript
// entities/donation/model.ts
import type { Donation } from '@prisma/client';

export type DonationWithMeta = Donation & {
  portalLabel?: string;
};

export const DonationStatus = {
  PENDING: 'PENDING',
  ONE_STOP_SENT: 'ONE_STOP_SENT',
  DECLARED: 'DECLARED',
} as const;

// entities/donation/lib.ts
export function calcYearlyTotal(donations: Donation[]): number {
  return donations.reduce((sum, d) => sum + d.amount, 0);
}
```

### shared/
**責務**: 完全に共通の土台

- どの機能からも使える
- 他のレイヤーに依存しない
- UI部品、インフラ、定数

```typescript
// shared/lib/prisma.ts
// shared/lib/auth.ts
// shared/ui/button.tsx
// shared/config/prefectures.ts
```

## 依存関係のルール

```
app → features / entities / shared
features → entities / shared
entities → shared
shared → 依存なし
```

**上位から下位への一方通行**

## データフロー

### 読み取り（GET）
```
Server Component (app/*)
  ↓ Prisma直接
Database
  ↓
UI Component (features/*/ui)
```

### 書き込み（POST/PUT/DELETE）
```
Client Component (features/*/ui)
  ↓
Server Action (app/*/actions.ts)
  ↓ features/*/lib のロジック使用
  ↓ Prisma
Database
  ↓ revalidatePath
再レンダリング
```

## Server Actions の配置

**app/*/actions.ts に配置**

```typescript
// app/donations/actions.ts
'use server'

import { prisma } from '@/shared/lib/prisma';
import { donationSchema } from '@/features/donations/lib/donationSchema';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export async function createDonation(data: unknown) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  
  const validated = donationSchema.parse(data);
  
  await prisma.donation.create({
    data: {
      ...validated,
      userId: session.user.id,
    },
  });
  
  revalidatePath('/donations');
}
```

**理由**:
- ページと密接に関連
- Next.js の推奨パターン
- ビジネスロジックは features/*/lib から呼び出す

## 状態管理戦略

### MVPでは状態管理ライブラリ不要

- **サーバー状態**: Server Components + Server Actions
- **フォーム状態**: React Hook Form
- **UI状態**: useState
- **グローバル状態**: 最小限（必要なら Context API）

### 将来的な拡張
- モバイルアプリ対応が必要になったら `/api/*` を追加
- ビジネスロジックは `features/*/lib` にあるため、API Routeから呼び出すだけ

## コンポーネント設計

### Server Component vs Client Component

**Server Component（デフォルト）**:
- 静的表示
- データベース直接アクセス
- 認証状態確認

**Client Component（必要な時のみ）**:
- フォーム（React Hook Form）
- インタラクティブUI
- useState/useEffect
- ブラウザAPI

### コンポーネント分割パターン

```typescript
// Server Component（親）
export default async function DonationsPage() {
  const donations = await prisma.donation.findMany(...);
  return <DonationTable donations={donations} />;
}

// Server Component（表示）
export function DonationTable({ donations }) {
  return (
    <table>
      {donations.map(d => <DonationRow key={d.id} donation={d} />)}
    </table>
  );
}

// Client Component（インタラクション）
"use client"
export function DonationRow({ donation }) {
  const handleDelete = async () => { ... };
  return (
    <tr>
      <td>{donation.itemName}</td>
      <td><Button onClick={handleDelete}>削除</Button></td>
    </tr>
  );
}
```

## 開発の進め方

### Phase 1: まずsimulatorだけフルパスで作る

1. `features/simulator/` を完成させる
2. `app/simulator/page.tsx` を実装
3. このアーキテクチャが機能することを確認

### Phase 2: 同じパターンで他機能を追加

1. `features/auth/`
2. `features/profile/`
3. `features/donations/`
4. `features/dashboard/`

**ポイント**: 最初に全部の構造を作らず、1機能ずつ完成させる

## 型定義の管理

### Zodスキーマから型を生成

```typescript
// features/simulator/lib/simulatorSchema.ts
import { z } from 'zod';

export const simulatorSchema = z.object({
  annualIncome: z.number().min(1_000_000).max(30_000_000),
  hasSpouse: z.boolean(),
  dependentsCount: z.number().min(0).max(10),
});

export type SimulatorInput = z.infer<typeof simulatorSchema>;
```

### Prisma型の拡張

```typescript
// entities/donation/model.ts
import type { Donation, User } from '@prisma/client';

export type DonationWithUser = Donation & {
  user: User;
};
```

## 将来の拡張性

### モバイルアプリ対応

```typescript
// 現在: Server Action
app/donations/actions.ts

// 将来: API Route追加（ロジックは共通）
app/api/donations/route.ts
  ↓
features/donations/lib/donationService.ts（共通ロジック）
```

### マイクロサービス化

entities/ と features/*/lib は独立性が高いため、別サービスへの切り出しも容易

## まとめ

このハイブリッド構成は：

✅ Next.js App Router の強みを活かせる
✅ FSD の機能独立性も確保
✅ 個人開発で過剰ではない
✅ 将来の拡張性も担保

**最初はsimulatorだけで試し、うまくいったら他機能も同じパターンで実装**
