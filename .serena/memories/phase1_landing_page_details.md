# Phase 1-4: ランディングページ実装詳細

最終更新: 2025-11-16

## 概要

Phase 1-4では、ふるさと納税ダッシュボードのランディングページとレイアウトコンポーネントを実装しました。
これにより、ユーザーがサイトにアクセスした際に魅力的なホームページが表示され、
シミュレーター機能への導線が明確になりました。

---

## 実装したコンポーネント

### 1. Header コンポーネント (`src/components/layout/Header.tsx`)

**特徴:**
- Sticky ヘッダー（スクロール時も上部に固定）
- backdrop-blur 効果で半透明な背景
- ロゴとサイト名（ホームアイコン + テキスト）
- ナビゲーションリンク（シミュレーターへ）
- 将来のログイン/サインアップボタン用にコメントアウト済み

**技術的ポイント:**
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
```
- `sticky top-0 z-50`: 常に画面上部に固定
- `bg-background/95`: 95%の不透明度
- `backdrop-blur`: 背後のコンテンツをぼかす効果

### 2. Footer コンポーネント (`src/components/layout/Footer.tsx`)

**特徴:**
- 4カラムグリッドレイアウト（レスポンシブ対応）
- サイト情報、機能リンク、サポートリンク、サイト説明
- 動的な年号表示（`new Date().getFullYear()`）
- 利用規約・プライバシーポリシーへのリンク

**レイアウト構造:**
```
[サイト情報] [機能] [サポート] [このサイトについて]
     |          |        |              |
  説明文    シミュレ  利用規約      免責事項
           ーター   プライバシー
                    ポリシー
```

### 3. ホームページ (`src/app/page.tsx`)

**セクション構成:**

#### a. ヒーローセクション
- キャッチコピー: 「ふるさと納税をもっとシンプルに」
- サブヘッド: 控除額シミュレーション～一元管理の説明
- CTAボタン: 「シミュレーションを始める」→ /simulator

#### b. 機能紹介セクション
3つのカードで主要機能を紹介:
1. **かんたんシミュレーション**
   - アイコン: 計算機
   - 説明: 会員登録不要で控除上限額を計算

2. **複数ポータル一元管理**
   - アイコン: クリップボード
   - 説明: 楽天、ふるなび、さとふるなどをまとめて管理

3. **手続き漏れ防止**
   - アイコン: チェックマーク
   - 説明: ワンストップ特例や確定申告のステータス管理

#### c. CTAセクション
- 「まずはシミュレーションから」
- シミュレーターへの再度の導線

#### d. FAQセクション
3つのよくある質問:
1. 会員登録しなくても使えますか？
2. シミュレーション結果は正確ですか？
3. 料金はかかりますか？

### 4. 利用規約ページ (`src/app/terms/page.tsx`)

**構成:**
- 第1条: 適用
- 第2条: 利用登録
- 第3条: 禁止事項（10項目）
- 第4条: 本サービスの提供の停止等
- 第5条: 免責事項

**メタデータ:**
```typescript
export const metadata = {
  title: "利用規約 | ふるさと納税ダッシュボード",
  description: "ふるさと納税ダッシュボードの利用規約",
};
```

### 5. プライバシーポリシーページ (`src/app/privacy/page.tsx`)

**構成:**
- 1. 個人情報の収集（メールアドレス、氏名、年収など）
- 2. 個人情報の利用目的
- 3. 個人情報の第三者提供
- 4. 個人情報の安全管理
- 5. Cookie（クッキー）の使用について
- 6. プライバシーポリシーの変更

**メタデータ:**
```typescript
export const metadata = {
  title: "プライバシーポリシー | ふるさと納税ダッシュボード",
  description: "ふるさと納税ダッシュボードのプライバシーポリシー",
};
```

### 6. ルートレイアウト更新 (`src/app/layout.tsx`)

**変更内容:**
- Header/Footer コンポーネントのインポートと配置
- 言語設定を日本語に変更（`lang="ja"`）
- メタデータを日本語に更新

**レイアウト構造:**
```tsx
<div className="flex min-h-screen flex-col">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</div>
```

---

## デザインシステム

### カラーパレット
- Primary: アクセントカラー（CTA、リンク）
- Muted: サブテキスト、背景
- Background: ページ背景
- Foreground: メインテキスト

### タイポグラフィ
- h1: `text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl`
- h2: `text-3xl font-bold tracking-tight sm:text-4xl`
- CardTitle: `text-sm font-semibold` または `text-lg`
- Body: `text-muted-foreground`

### レスポンシブ対応
- モバイルファースト設計
- ブレークポイント: sm, md, lg
- グリッドレイアウト: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`

---

## 実装上の工夫

### 1. 段階的な情報開示
- ヒーローセクションでシンプルなメッセージ
- 機能紹介で詳細を説明
- FAQで疑問を解消

### 2. 複数のCTA
- ヒーローセクション
- CTAセクション
- FAQ後にも導線

### 3. 将来の拡張性
- ログイン/サインアップボタンをコメントアウトで準備
- ダッシュボード、寄付管理へのリンクも準備済み

### 4. SEO対策
- 適切なメタデータ設定
- セマンティックなHTML構造
- `lang="ja"` 属性

---

## ビルド結果

```
✓ Compiled successfully in 1727.5ms
✓ Running TypeScript ... OK
✓ Generating static pages (7/7)
✓ Finalizing page optimization

Route (app)
┌ ○ /                    (ホームページ)
├ ○ /_not-found
├ ○ /privacy            (プライバシーポリシー)
├ ○ /simulator          (シミュレーター)
└ ○ /terms              (利用規約)

○ (Static) prerendered as static content
```

全てのページが静的に生成され、高速な配信が可能です。

---

## コミット履歴

```
5682726 - feat: ランディングページとレイアウトコンポーネントを実装
          - Header/Footerコンポーネント作成
          - ホームページリニューアル
          - 利用規約・プライバシーポリシーページ作成
          - 日本語メタデータ設定

a0a9a0c - docs: update implementation progress for Phase 1-4 completion
          - 進捗状況の更新
```

---

## 次のステップ

Phase 1-5: エラーハンドリング
- `src/app/error.tsx` の実装
- `src/app/not-found.tsx` の実装
- モバイル表示の最終確認
- Lint/TypeScript チェック
- Vercel デプロイ準備

---

## 参考リンク

- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [shadcn/ui Card](https://ui.shadcn.com/docs/components/card)
- [Tailwind CSS Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur)
