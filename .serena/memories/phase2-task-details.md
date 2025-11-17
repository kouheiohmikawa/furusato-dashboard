# Phase 2: MVP v1.0 - 詳細タスクリスト

## 概要
- **目標**: データベース・認証・基本管理機能の実装
- **期間**: 2〜3週間
- **技術選定**: Supabase + Supabase Auth

---

## 📋 タスクリスト（20タスク）

### グループ1: Supabaseセットアップ（1日）

#### ✅ タスク1: Supabaseアカウント作成とプロジェクトセットアップ
**所要時間**: 30分

**手順**:
1. https://supabase.com でアカウント作成
2. 「New Project」をクリック
3. プロジェクト情報入力:
   - Name: `furusato-dashboard`
   - Database Password: 強力なパスワード（保存必須）
   - Region: `Northeast Asia (Tokyo)` または `Southeast Asia (Singapore)`
4. プロジェクトが作成されるまで待機（2-3分）
5. Project Settings → API から以下をコピー:
   - Project URL
   - anon/public key

**成果物**:
- Supabaseプロジェクト
- API認証情報

---

#### ✅ タスク2: 環境変数の設定とSupabaseクライアントライブラリのインストール
**所要時間**: 15分

**手順**:
```bash
# 1. パッケージインストール
npm install @supabase/supabase-js @supabase/ssr

# 2. .env.local ファイル作成（プロジェクトルート）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**:
- `.env.local` を `.gitignore` に追加済みか確認
- 本番環境では Vercel の環境変数に設定

**成果物**:
- `.env.local` ファイル
- Supabaseライブラリのインストール

---

#### ✅ タスク3: Supabaseクライアントヘルパー関数の作成（クライアント/サーバー）
**所要時間**: 30分

**ファイル作成**:

1. `src/lib/supabase/client.ts` (クライアント用):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

2. `src/lib/supabase/server.ts` (サーバー用):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component からの呼び出しの場合はエラーを無視
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component からの呼び出しの場合はエラーを無視
          }
        },
      },
    }
  )
}
```

3. `src/lib/supabase/middleware.ts` (ミドルウェア用):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**成果物**:
- クライアント用Supabaseクライアント
- サーバー用Supabaseクライアント
- ミドルウェア用セッション更新関数

---

### グループ2: データベース設計・構築（2日）

#### ✅ タスク4: データベーススキーマ設計
**所要時間**: 2時間

**テーブル設計**:

1. **profiles** (ユーザープロフィール)
```sql
- id: UUID (PRIMARY KEY, REFERENCES auth.users)
- display_name: TEXT
- prefecture: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

2. **donations** (寄付記録)
```sql
- id: UUID (PRIMARY KEY)
- user_id: UUID (REFERENCES auth.users)
- municipality_name: TEXT
- prefecture: TEXT
- amount: INTEGER
- donation_date: DATE
- return_item_name: TEXT (nullable)
- is_one_stop: BOOLEAN (default: false)
- memo: TEXT (nullable)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

3. **simulation_history** (シミュレーション履歴)
```sql
- id: UUID (PRIMARY KEY)
- user_id: UUID (REFERENCES auth.users)
- simulation_type: TEXT ('simple' | 'detailed')
- input_data: JSONB
- result_data: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
```

4. **municipalities** (自治体マスター - 将来用)
```sql
- id: UUID (PRIMARY KEY)
- name: TEXT
- prefecture: TEXT
- code: TEXT
- official_url: TEXT (nullable)
- created_at: TIMESTAMP WITH TIME ZONE
```

**成果物**:
- スキーマ設計ドキュメント
- ER図（手書きでもOK）

---

#### ✅ タスク5: Supabaseでテーブル作成とマイグレーション実行
**所要時間**: 1時間

**手順**:
1. Supabase Dashboard → SQL Editor を開く
2. 以下のSQLを実行:

```sql
-- profiles テーブル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  prefecture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- donations テーブル
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  municipality_name TEXT NOT NULL,
  prefecture TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  donation_date DATE NOT NULL,
  return_item_name TEXT,
  is_one_stop BOOLEAN DEFAULT false,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- simulation_history テーブル
CREATE TABLE simulation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('simple', 'detailed')),
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- municipalities テーブル（将来用）
CREATE TABLE municipalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  code TEXT UNIQUE,
  official_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX donations_user_id_idx ON donations(user_id);
CREATE INDEX donations_donation_date_idx ON donations(donation_date);
CREATE INDEX simulation_history_user_id_idx ON simulation_history(user_id);
CREATE INDEX municipalities_prefecture_idx ON municipalities(prefecture);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**成果物**:
- 作成されたテーブル
- インデックス
- トリガー関数

---

#### ✅ タスク6: Row Level Security（RLS）ポリシーの設定
**所要時間**: 1時間

**手順**:
Supabase Dashboard → SQL Editor で以下を実行:

```sql
-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- donations ポリシー
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own donations"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donations"
  ON donations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own donations"
  ON donations FOR DELETE
  USING (auth.uid() = user_id);

-- simulation_history ポリシー
CREATE POLICY "Users can view own simulation history"
  ON simulation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulation history"
  ON simulation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulation history"
  ON simulation_history FOR DELETE
  USING (auth.uid() = user_id);
```

**テスト**:
1. Supabase Dashboard → Table Editor で直接データを追加してみる
2. 別のユーザーのデータが見えないことを確認

**成果物**:
- 設定されたRLSポリシー

---

### グループ3: 認証機能実装（4日）

#### ✅ タスク7: Supabase Authのメール認証設定
**所要時間**: 30分

**手順**:
1. Supabase Dashboard → Authentication → Settings
2. Email Auth を有効化
3. Email Templates をカスタマイズ（オプション）:
   - Confirm signup
   - Reset password
   - Magic link
4. Site URL を設定:
   - Development: `http://localhost:3000`
   - Production: (後で設定)
5. Redirect URLs を追加:
   - `http://localhost:3000/auth/callback`

**成果物**:
- メール認証の設定完了

---

#### ✅ タスク8: ログインページの実装
**所要時間**: 3時間

**ファイル**: `src/app/login/page.tsx`

**実装内容**:
- メールアドレス・パスワード入力フォーム
- ログインボタン
- 新規登録リンク
- パスワードリセットリンク
- エラー表示
- ローディング状態

**UI**: shadcn/ui の Form コンポーネント使用

**成果物**:
- ログインページ
- ログイン機能

---

#### ✅ タスク9: 新規登録ページの実装
**所要時間**: 3時間

**ファイル**: `src/app/signup/page.tsx`

**実装内容**:
- メールアドレス・パスワード・パスワード確認入力
- 利用規約同意チェックボックス
- 新規登録ボタン
- ログインリンク
- エラー表示
- 成功時のメール確認メッセージ

**バリデーション**:
- メール形式チェック
- パスワード強度チェック（8文字以上）
- パスワード一致チェック

**成果物**:
- 新規登録ページ
- 登録後のプロフィール自動作成

---

#### ✅ タスク10: パスワードリセット機能の実装
**所要時間**: 2時間

**ファイル**:
- `src/app/forgot-password/page.tsx` (リセットリクエスト)
- `src/app/reset-password/page.tsx` (新パスワード設定)

**実装内容**:
1. リセットリクエストページ:
   - メールアドレス入力
   - リセットメール送信
2. 新パスワード設定ページ:
   - 新パスワード入力
   - パスワード確認
   - 更新ボタン

**成果物**:
- パスワードリセット機能

---

#### ✅ タスク11: 認証状態管理とミドルウェアの実装
**所要時間**: 2時間

**ファイル**: `src/middleware.ts`

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**保護が必要なルート**:
- `/dashboard/*`
- `/donations/*`
- `/profile/*`

**リダイレクト処理**:
- 未認証ユーザー → `/login`
- 認証済みユーザー → `/dashboard`

**成果物**:
- ミドルウェア
- 認証状態管理

---

#### ✅ タスク12: プロフィール編集ページの実装
**所要時間**: 3時間

**ファイル**: `src/app/profile/page.tsx`

**実装内容**:
- 表示名編集
- 都道府県選択
- メールアドレス表示（変更不可）
- パスワード変更リンク
- 保存ボタン
- ログアウトボタン

**成果物**:
- プロフィール編集ページ

---

### グループ4: 寄付記録管理機能（5日）

#### ✅ タスク13: 寄付記録登録フォームの実装
**所要時間**: 4時間

**ファイル**: `src/app/donations/new/page.tsx`

**実装内容**:
- 自治体名入力
- 都道府県選択
- 寄付金額入力
- 寄付日選択（カレンダーUI）
- 返礼品名（オプション）
- ワンストップ特例チェックボックス
- メモ（オプション）
- 登録ボタン

**バリデーション**:
- Zodスキーマ作成
- 金額は正の整数
- 日付は過去または今日

**成果物**:
- 寄付記録登録フォーム
- バリデーションスキーマ

---

#### ✅ タスク14: 寄付記録一覧ページの実装（リスト表示、フィルタリング）
**所要時間**: 5時間

**ファイル**: `src/app/donations/page.tsx`

**実装内容**:
- テーブル形式の一覧表示
- フィルタリング機能:
  - 年度選択
  - 都道府県選択
  - 金額範囲
- ソート機能（日付、金額）
- ページネーション（10件/20件/50件）
- 新規登録ボタン
- 編集・削除ボタン

**統計情報表示**:
- 表示中の合計金額
- 件数

**成果物**:
- 寄付記録一覧ページ

---

#### ✅ タスク15: 寄付記録編集・削除機能の実装
**所要時間**: 3時間

**ファイル**: `src/app/donations/[id]/edit/page.tsx`

**実装内容**:
- 既存データの読み込み
- 編集フォーム（登録フォームと同様）
- 更新ボタン
- 削除ボタン（確認ダイアログ付き）
- キャンセルボタン

**成果物**:
- 寄付記録編集ページ
- 削除機能

---

#### ✅ タスク16: 年度別寄付集計機能の実装
**所要時間**: 3時間

**ファイル**: `src/app/dashboard/page.tsx`

**実装内容**:
- 年度選択（2020年〜現在）
- 年度別集計表示:
  - 合計寄付額
  - 寄付件数
  - 自治体数
- シミュレーション結果との比較:
  - 控除上限額
  - 残り枠
  - 達成率（プログレスバー）
- 月別グラフ（簡易版、将来はPhase 4で詳細化）

**成果物**:
- ダッシュボードページ
- 年度別集計機能

---

### グループ5: シミュレーション履歴（2日）

#### ✅ タスク17: シミュレーション履歴保存機能の実装
**所要時間**: 2時間

**対象ファイル**:
- `src/app/simulator/page.tsx`（既存）
- `src/features/simulator/ui/SimulatorResult.tsx`（既存）

**追加実装**:
- 「この結果を保存」ボタン追加
- 保存時にSupabaseへ送信
- 保存成功トースト表示

**データ保存形式**:
```typescript
{
  simulation_type: 'simple' | 'detailed',
  input_data: { /* フォーム入力値 */ },
  result_data: { /* 計算結果 */ }
}
```

**成果物**:
- シミュレーション結果保存機能

---

#### ✅ タスク18: シミュレーション履歴一覧・再読み込み機能の実装
**所要時間**: 3時間

**ファイル**: `src/app/history/page.tsx`

**実装内容**:
- 履歴一覧表示（カード形式）:
  - 保存日時
  - シミュレーション種類（簡易/詳細）
  - 計算結果（控除上限額）
- 「再読み込み」ボタン → シミュレーターページへ遷移
- 「削除」ボタン
- フィルタリング（種類、日付範囲）

**成果物**:
- シミュレーション履歴ページ

---

### グループ6: 最終調整（1日）

#### ✅ タスク19: ビルド確認とテスト
**所要時間**: 2時間

**テスト項目**:
- [ ] ユーザー登録 → メール確認 → ログイン
- [ ] プロフィール編集
- [ ] 寄付記録のCRUD
- [ ] フィルタリング・ソート
- [ ] 年度別集計
- [ ] シミュレーション履歴の保存・読み込み
- [ ] ログアウト
- [ ] パスワードリセット
- [ ] レスポンシブ表示確認
- [ ] TypeScriptエラーゼロ
- [ ] ビルド成功

**成果物**:
- テスト完了
- バグ修正

---

#### ✅ タスク20: GitHubへのコミットとプッシュ
**所要時間**: 30分

**手順**:
```bash
git add .
git commit -m "feat: implement Phase 2 - database, auth, and basic management features

- Setup Supabase project and client libraries
- Create database schema with RLS policies
- Implement authentication (login, signup, password reset)
- Add donation record management (CRUD)
- Implement simulation history feature
- Add dashboard with annual summary"

git push origin feature/setup-project
```

**成果物**:
- GitHubへのプッシュ完了

---

## 🎯 Phase 2 完了条件

- ✅ Supabaseプロジェクト稼働
- ✅ 認証機能（ログイン、新規登録、パスワードリセット）
- ✅ プロフィール管理
- ✅ 寄付記録のCRUD機能
- ✅ フィルタリング・ソート
- ✅ 年度別集計表示
- ✅ シミュレーション履歴管理
- ✅ すべての機能が動作
- ✅ TypeScriptエラーゼロ
- ✅ GitHubにコミット済み

---

## 📝 注意事項

### セキュリティ
- パスワードは平文保存しない（Supabase Authが自動処理）
- RLSポリシー必須（データ漏洩防止）
- 環境変数を `.gitignore` に追加

### パフォーマンス
- インデックスの活用
- ページネーション実装
- 不要なデータ取得を避ける

### UX
- ローディング状態の表示
- エラーメッセージの表示
- 成功時のフィードバック（トースト）
- モバイル対応

---

## 次のステップ

Phase 2完了後:
1. Vercelへのデプロイ準備
2. Phase 3（自治体検索・お気に入り）の計画
3. ユーザーフィードバック収集
