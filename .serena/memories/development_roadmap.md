# 開発ロードマップ（確定版）

## 基本方針

**ログイン不要機能を先に作り、早期公開を目指す**

- Phase 1: シミュレーター機能（ログイン不要）
- Phase 2: 認証・寄付管理機能（ログイン必須）
- 各フェーズで公開可能な状態を作る

---

## Phase 1: MVP v0.5（最小公開可能プロダクト）

**目標**: シミュレーター単体で価値提供、早期公開
**期間**: 約10-13時間（1-2日）

### 1-1. プロジェクト基盤構築（2-3時間）

```bash
pnpm create next-app@latest furusato-dashboard
# TypeScript, ESLint, Tailwind, src/, App Router, @/*
```

- [ ] Next.jsプロジェクト作成
- [ ] shadcn/ui セットアップ
  ```bash
  pnpm dlx shadcn@latest init
  pnpm dlx shadcn@latest add button input card form select label
  ```
- [ ] ディレクトリ構造整備（features/simulator, shared/）
- [ ] ESLint/Prettier設定
- [ ] GitHub リポジトリ作成・初回コミット

### 1-2. 定数・バリデーション準備（1時間）

- [ ] `src/shared/config/prefectures.ts` 作成
- [ ] `src/features/simulator/lib/simulatorSchema.ts` 作成（Zod）
- [ ] 基本的なレイアウトコンポーネント

### 1-3. シミュレーション機能実装（3-4時間）

#### ビジネスロジック
- [ ] `src/features/simulator/lib/calculateLimit.ts`
  - `estimateLimitYen()` 関数
  - `calculateSafeLimit()` 関数
- [ ] ユニットテスト作成（Vitest）

#### UI実装
- [ ] `src/features/simulator/ui/SimulatorForm.tsx`
  - React Hook Form
  - Zodバリデーション
  - レスポンシブ対応
- [ ] `src/features/simulator/ui/SimulatorResult.tsx`
  - 推定上限額表示
  - 安全ライン表示
  - 注意書き・前提条件

#### ページ統合
- [ ] `src/app/simulator/page.tsx` 実装

### 1-4. ランディングページ（2-3時間）

- [ ] `src/app/page.tsx` 実装
  - ヒーローセクション
  - 機能紹介
  - CTA（「シミュレーションしてみる」）
  - 簡単なFAQセクション
- [ ] `src/app/terms/page.tsx` 利用規約（仮でもOK）
- [ ] `src/app/privacy/page.tsx` プライバシーポリシー（仮でもOK）
- [ ] ヘッダー・フッター実装

### 1-5. エラーハンドリング & 最終調整（1-2時間）

- [ ] `src/app/error.tsx` 実装
- [ ] `src/app/not-found.tsx` 実装
- [ ] モバイル表示確認
- [ ] `pnpm lint` エラー修正
- [ ] TypeScript エラーゼロ確認

### 🎉 マイルストーン1: MVP v0.5 完成

**成果物**:
- ログイン不要でシミュレーターが使える
- ランディングページで価値訴求
- デプロイ可能な状態

**次のステップ**: Vercelにデプロイして早期フィードバック取得

---

## Phase 2: データベース & 認証基盤（2-3時間）

### 2-1. Docker Compose でローカルPostgreSQL

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: furusato_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] `docker-compose.yml` 作成
- [ ] PostgreSQL起動確認

### 2-2. Prisma セットアップ

```bash
pnpm add -D prisma
pnpm add @prisma/client
pnpm prisma init
```

- [ ] Prismaインストール
- [ ] `prisma/schema.prisma` にスキーマ定義
  - User, Profile, Donation
  - Account, Session, VerificationToken（Auth.js用）
- [ ] `.env.local` に環境変数設定
- [ ] マイグレーション実行
  ```bash
  pnpm prisma migrate dev --name init
  pnpm prisma generate
  ```
- [ ] `src/shared/lib/prisma.ts` 作成（PrismaClientシングルトン）

---

## Phase 3: 認証機能実装（4-6時間）

### 3-1. Auth.js セットアップ

```bash
pnpm add next-auth@beta @auth/prisma-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

- [ ] `src/shared/lib/auth.ts` 設定ファイル作成
- [ ] Credentials Provider 設定
- [ ] Prisma Adapter 設定
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 作成

### 3-2. サインアップ機能

- [ ] `src/features/auth/lib/authSchema.ts` Zodスキーマ
- [ ] `src/features/auth/ui/SignupForm.tsx`（React Hook Form）
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] パスワードハッシュ化（bcryptjs）

### 3-3. ログイン機能

- [ ] `src/features/auth/ui/LoginForm.tsx`
- [ ] `src/app/(auth)/login/page.tsx`

### 3-4. 認証ガード

- [ ] `middleware.ts` 作成
- [ ] 保護ルート設定（/dashboard, /donations, /profile）

### 3-5. Rate Limiting

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

- [ ] Upstash アカウント作成 & Redis作成
- [ ] `src/shared/lib/rate-limit.ts` 作成
- [ ] 認証APIにRate Limit適用
  - ログイン: 5回/5分/IP
  - サインアップ: 3回/時間/IP

### 3-6. レイアウト更新

- [ ] `src/app/layout.tsx` にヘッダー追加
- [ ] ログイン状態で表示切替
- [ ] ログアウト機能

---

## Phase 4: プロフィール機能（2-3時間）

- [ ] `src/features/profile/lib/profileSchema.ts` Zodスキーマ
- [ ] `src/features/profile/ui/ProfileForm.tsx`
- [ ] `src/app/(protected)/profile/page.tsx`（Server Component）
- [ ] `src/app/(protected)/profile/actions.ts`（Server Actions）
  - createOrUpdateProfile

---

## Phase 5: 寄付管理機能（6-8時間）

### 5-1. entities/donation 作成

- [ ] `src/entities/donation/model.ts`
  - Donation型、DonationStatus enum
- [ ] `src/entities/donation/lib.ts`
  - calcYearlyTotal等

### 5-2. features/donations 作成

- [ ] `src/features/donations/lib/donationSchema.ts` Zodスキーマ
- [ ] `src/features/donations/ui/DonationTable.tsx`
- [ ] `src/features/donations/ui/DonationForm.tsx`
- [ ] `src/features/donations/ui/DonationFilters.tsx`

### 5-3. ページ実装

- [ ] `src/app/(protected)/donations/page.tsx`（一覧）
  - Server Componentで直接Prismaアクセス
  - フィルタ（年度、ステータス）
  - 検索機能
- [ ] `src/app/(protected)/donations/new/page.tsx`（新規登録）
- [ ] `src/app/(protected)/donations/actions.ts`（Server Actions）
  - createDonation
  - updateDonation
  - deleteDonation

### 5-4. 編集・削除機能

- [ ] 編集モーダル（shadcn/ui Dialog）
- [ ] 削除確認ダイアログ

---

## Phase 6: ダッシュボード（4-6時間）

### 6-1. features/dashboard 作成

- [ ] `src/features/dashboard/lib/calculateSummary.ts`
  - 上限額取得（Profileから）
  - 寄付合計額計算
  - 残り枠計算
  - 手続き必要な寄付抽出

- [ ] `src/features/dashboard/ui/SummaryCards.tsx`
- [ ] `src/features/dashboard/ui/RecentDonations.tsx`

### 6-2. ページ実装

- [ ] `src/app/(protected)/dashboard/page.tsx`
  - サマリーカード（上限額、寄付合計、残り枠）
  - 上限超過警告
  - 手続き必要な寄付一覧
  - 最近の寄付履歴
  - ポータル別内訳

---

## Phase 7: 統合 & UX改善（2-3時間）

### 7-1. シミュレーションとプロフィールの連携

- [ ] ログインユーザーはプロフィール情報を自動入力
- [ ] シミュレーター → 「プロフィールに保存」ボタン

### 7-2. 全体的なUX改善

- [ ] ダッシュボード → シミュレーターへの導線
- [ ] トースト通知（成功・エラー）
- [ ] ローディング状態の改善

---

## Phase 8: テスト & リファクタリング（2-3時間）

- [ ] 全機能の手動テスト
- [ ] モバイル表示確認
- [ ] エッジケーステスト
- [ ] `pnpm lint` 実行
- [ ] TypeScript エラーゼロ確認
- [ ] 不要なコンソールログ削除
- [ ] パフォーマンス最適化

---

## Phase 9: 本番デプロイ（v1.0）（2-3時間）

### 9-1. 本番DB準備

- [ ] Neon / Supabase アカウント作成
- [ ] 本番PostgreSQLインスタンス作成
- [ ] DATABASE_URL取得

### 9-2. Vercel デプロイ

- [ ] Vercelアカウント作成
- [ ] GitHubリポジトリ連携
- [ ] プロジェクト作成
- [ ] 環境変数設定
  - DATABASE_URL
  - AUTH_SECRET
  - NEXTAUTH_URL
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN

### 9-3. 本番マイグレーション

```bash
DATABASE_URL="<本番URL>" pnpm prisma migrate deploy
```

### 9-4. 動作確認

- [ ] 本番環境での動作確認
- [ ] Vercel Analytics 有効化

### 🎉 マイルストーン2: MVP v1.0 完成

---

## Phase 10: Phase 1.5（余裕があれば）

### データエクスポート機能（4時間）

- [ ] `src/app/(protected)/donations/export/route.ts` 実装（CSV生成）
- [ ] ダウンロードボタン追加

### パスワードリセット機能（4-6時間）

```bash
pnpm add resend
```

- [ ] Resend アカウント作成
- [ ] `src/app/api/auth/request-reset/route.ts` 実装
- [ ] `src/app/api/auth/reset/route.ts` 実装
- [ ] メールテンプレート作成
- [ ] `/reset-password` ページ実装

---

## 作業量の目安（更新版）

| Phase | 推定時間 | 優先度 | 成果物 |
|-------|---------|--------|--------|
| **Phase 1: MVP v0.5** | **10-13時間** | 🔴 必須 | **シミュレーター公開** |
| Phase 2: DB/Prisma | 2-3時間 | 🔴 必須 | DB基盤 |
| Phase 3: 認証 | 4-6時間 | 🔴 必須 | ログイン機能 |
| Phase 4: プロフィール | 2-3時間 | 🔴 必須 | プロフィール管理 |
| Phase 5: 寄付管理 | 6-8時間 | 🔴 必須 | 寄付CRUD |
| Phase 6: ダッシュボード | 4-6時間 | 🔴 必須 | ダッシュボード |
| Phase 7: 統合 | 2-3時間 | 🟡 推奨 | UX改善 |
| Phase 8: テスト | 2-3時間 | 🟡 推奨 | 品質保証 |
| Phase 9: デプロイ v1.0 | 2-3時間 | 🔴 必須 | **本番公開** |
| Phase 10: Phase 1.5 | 4-6時間 | 🟢 後回しOK | 追加機能 |

**合計**: 約38-54時間（1-2週間）

---

## 開発の進め方（重要）

### 「まずはsimulatorだけフルパスで作る」

1. **Phase 1を完全に完成させる**
   - features/simulator/
   - app/simulator/page.tsx
   - このアーキテクチャが機能することを確認

2. **同じパターンで他機能を追加**
   - features/auth/ → features/profile/ → features/donations/

3. **最初に全部の構造を作らない**
   - 1機能ずつ完成させる方が効率的

---

## 次のアクション

**今すぐPhase 1-1から開始**:

```bash
cd ~/Documents
pnpm create next-app@latest furusato-dashboard
```
