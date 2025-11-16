# アーキテクチャ設計

## 全体構成
Next.js = フロント + API + SSRを担うフルスタックアプリ
- Prisma + PostgreSQL = データ永続化層
- Auth.js + Prisma Adapter = 認証・セッション管理

## レイヤー構成
1. **Presentation Layer (UI)**
   - `app/**/page.tsx` (サーバーコンポーネント)
   - `"use client"` コンポーネント (フォーム・インタラクティブUI)

2. **Application Layer**
   - hooks, helper関数
   - API呼び出し、状態管理

3. **API Layer**
   - REST API: `app/api/**/route.ts`

4. **Domain/Data Layer**
   - Prismaリポジトリ層
   - PostgreSQL

## ディレクトリ構成
```
src/
  app/
    layout.tsx
    page.tsx                  # ランディング
    simulator/page.tsx        # シミュレーション
    login/page.tsx
    signup/page.tsx
    dashboard/page.tsx
    donations/
      page.tsx                # 一覧
      new/page.tsx            # 新規登録
    profile/page.tsx
    
    api/
      simulate/simple/route.ts
      donations/
        route.ts              # GET/POST
        [id]/route.ts         # PUT/DELETE
      profile/route.ts
      scrape/donation/route.ts  # (Phase 2)
      auth/[...nextauth]/route.ts
    
    error.tsx                 # エラーハンドリング
    global-error.tsx
    not-found.tsx

  components/
    layout/
    simulator/
    dashboard/
    donations/
    profile/
    ui/                       # 共通UI (Button, Card等)

  lib/
    prisma.ts                 # PrismaClient
    auth.ts                   # Auth.js設定
    simulation/simple.ts      # シミュレーションロジック
    scraping/portals/         # (Phase 2) スクレイピング

  styles/
    globals.css

prisma/
  schema.prisma
```

## セキュリティ設計
- パスワード: bcrypt ハッシュ化
- セッション: HttpOnly Cookie
- CSRF対策: Next.js/Auth.js標準機能
- Rate Limiting: 認証APIに対して実装（upstash/ratelimit等）
- XSS対策: React標準のエスケープ + CSPヘッダー
