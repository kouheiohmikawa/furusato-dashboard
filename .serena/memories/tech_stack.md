# 技術スタック

## フロントエンド
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **UI/Styling**: 
  - Tailwind CSS
  - shadcn/ui（フォーム・カード・モーダル等）

## バックエンド
- **API**: Next.js Route Handlers (app/api/**/route.ts)
- **Language**: TypeScript (Node.js)

## データベース & ORM
- **DB**: PostgreSQL
  - 開発: ローカル or クラウドdev環境
  - 本番: Neon / Supabase / Railway / Render
- **ORM**: Prisma
  - スキーマ駆動 (prisma/schema.prisma)
  - 型安全なクエリ
  - マイグレーション機能

## 認証
- **ライブラリ**: Auth.js (NextAuth) - App Router対応版
- **Adapter**: Prisma Adapter
- **方式**: 
  - Phase 1: メール+パスワード (Credentials Provider)
  - Phase 2: OAuth (Google/LINE等)
- **セッション管理**: Cookie (HttpOnly/Secure/SameSite=Lax)、DBセッション

## インフラ
- **Hosting**: Vercel
  - GitHub連携自動デプロイ
  - Serverless Functions
- **DB**: Neon / Supabase等（Vercel接続可能なPostgres）

## 開発・運用ツール
- **バージョン管理**: Git + GitHub
- **パッケージマネージャ**: pnpm or npm
- **CI**: GitHub Actions
  - ESLint + TypeScript チェック
- **CD**: Vercel自動デプロイ (main branch)
- **監視**: Vercel Analytics（初期から有効化）
- **エラートラッキング**: Sentry（必要になったら導入）

## テスト戦略
- **Linting**: ESLint + TypeScript
- **単体テスト**: Vitest/Jest（シミュレーションロジック等）
- **E2Eテスト**: Playwright（余裕があれば）

## 環境変数
- `DATABASE_URL`: Postgres接続文字列
- `AUTH_SECRET`: Auth.js秘密鍵
- `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL`: アプリURL
- (将来) メール送信APIキー (Resend/SendGrid)
