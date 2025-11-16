# 開発計画

## 実装順序（推奨）

### 1. プロジェクト基盤構築
- [ ] Next.js プロジェクト作成（TypeScript + Tailwind + App Router）
- [ ] ESLint, Prettier 設定
- [ ] ディレクトリ構成の整備
- [ ] GitHub リポジトリ作成
- [ ] 基本的な error.tsx, not-found.tsx 作成

### 2. データベース & Prisma セットアップ
- [ ] Prisma インストール・初期化
- [ ] スキーマ定義（User, Profile, Donation, Auth関連）
- [ ] ローカルPostgres or Neon開発環境準備
- [ ] マイグレーション実行
- [ ] Prisma Client セットアップ (`lib/prisma.ts`)

### 3. 認証機能実装
- [ ] Auth.js (NextAuth) + Prisma Adapter セットアップ
- [ ] Credentials Provider 実装
- [ ] `/signup` ページ実装
- [ ] `/login` ページ実装
- [ ] パスワードリセット機能実装
- [ ] 認証ガード（middleware）実装
- [ ] 簡易Rate Limiting実装（認証API）

### 4. プロフィール機能
- [ ] `/profile` ページ実装
- [ ] `GET /api/profile` 実装
- [ ] `PUT /api/profile` 実装
- [ ] フォームバリデーション

### 5. シミュレーション機能
- [ ] シミュレーションロジック実装 (`lib/simulation/simple.ts`)
- [ ] ユニットテスト作成
- [ ] `POST /api/simulate/simple` 実装
- [ ] `/simulator` ページ実装（非ログインでもアクセス可）
- [ ] 結果表示UI

### 6. 寄付管理機能（CRUD）
- [ ] `GET /api/donations` 実装
- [ ] `POST /api/donations` 実装
- [ ] `PUT /api/donations/:id` 実装
- [ ] `DELETE /api/donations/:id` 実装
- [ ] `/donations` 一覧ページ実装
- [ ] `/donations/new` 新規登録ページ実装
- [ ] フィルタ・ソート・検索機能
- [ ] 編集・削除UI

### 7. ダッシュボード
- [ ] `/dashboard` ページ実装
- [ ] サマリー表示（上限額、寄付合計、残り枠）
- [ ] 手続き必要な寄付の一覧
- [ ] グラフ・チャート（簡易版）

### 8. ランディングページ
- [ ] `/` ページ実装
- [ ] サービス紹介セクション
- [ ] CTAボタン
- [ ] デザイン調整

### 9. 本番デプロイ準備
- [ ] Vercel プロジェクト作成
- [ ] 本番用Postgres準備（Neon等）
- [ ] 環境変数設定
- [ ] プライバシーポリシー・利用規約ページ作成
- [ ] `/terms`, `/privacy` ページ実装
- [ ] 本番デプロイ
- [ ] Vercel Analytics 有効化

### 10. Phase 1.5（余裕があれば）
- [ ] データエクスポート機能（CSV）
- [ ] エラーログ改善
- [ ] パフォーマンス最適化

## Phase 2以降の機能
- スクレイピング機能（慎重に）
- OAuth認証（Google/LINE）
- メール認証
- 領収書画像管理
- リマインダー機能
- 複数年度比較・高度な集計
- タグ機能

## 技術的留意事項
- **Serverlessタイムアウト**: 重い処理は避ける（特にスクレイピング）
- **コスト管理**: Vercel + Neon無料枠からスタート
- **セキュリティ**: 
  - パスワードハッシュ化（bcrypt）
  - Rate Limiting（認証API）
  - CSRF/XSS対策
- **テスト**: シミュレーションロジックは必ずユニットテスト
- **エラーハンドリング**: グローバルエラーページを早めに実装
