# 技術選定の最終決定事項

## パッケージ・ライブラリ選定

### パッケージマネージャー
- **採用**: pnpm
- **理由**: 高速、依存関係軽量、モノレポ対応、Next.js/Vercel相性◎

### バリデーション
- **採用**: Zod
- **用途**: フロント/バックエンド共通のスキーマ定義
- **配置**: `src/lib/validation/` 配下にスキーマ定義

### フォームライブラリ
- **採用**: React Hook Form + @hookform/resolvers/zod
- **方針**: シンプルなフォームも含めて統一的に使用

### UI コンポーネント
- **採用**: shadcn/ui + Tailwind CSS
- **使用コンポーネント**: Button, Input, Select, Dialog, Card, Form
- **方針**: 基本的に積極採用、必要なものから順次導入

### Rate Limiting
- **採用**: @upstash/ratelimit (Upstash Redis)
- **制限値**:
  - ログイン: 5回/5分/IP
  - サインアップ: 3回/時間/IP
  - その他API: 必要に応じて後から追加
- **実装**: `src/lib/rate-limit.ts` にヘルパー作成

### メール送信（Phase 1.1以降）
- **採用予定**: Resend
- **用途**: パスワードリセット
- **方針**: MVP 1.0では未実装、1.1で追加予定

### グラフ・チャート（Phase 1.5以降）
- **採用予定**: Recharts
- **用途**: 年度別・ポータル別・カテゴリ別の可視化
- **方針**: MVP ではテキスト+テーブル表示のみ

## 開発環境構成

### ローカルDB
- **採用**: Docker Compose でローカルPostgreSQL
- **理由**: オフライン開発可、本番環境との差分最小化
- **構成**: `docker-compose.yml` に postgres サービス定義

### 環境変数管理
- **ローカル**: `.env.local` (Git管理外)
- **本番**: Vercel の環境変数
- **方針**: シンプルな2環境構成

## デザイン・UI/UX方針

### 参考デザイン
- MoneyForward等の家計簿系アプリのようなシンプルなダッシュボード
- shadcn/ui 標準トーン（グレー基調+差し色）
- スマホで見やすいカードUI

### スタイル指針
- やりすぎない（カラフルすぎない）
- 数字の視認性重視
- モバイルファースト

## 開発の進め方

### アプローチ: ハイブリッド型

**Phase 1: 骨組み作成**
全ページのルーティングとプレースホルダー作成
- `/`, `/simulator`, `/login`, `/signup`, `/dashboard`, `/donations`, `/profile`

**Phase 2: 機能単位で縦スライス実装**
1. 認証機能（Auth.js + User/Session）
2. Profile CRUD
3. シミュレーションAPI + フロント
4. 寄付CRUD + 一覧
5. ダッシュボード集計
6. ランディングページ
