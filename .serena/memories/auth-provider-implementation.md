# 認証状態管理の改善 (2025年11月22日)

## 概要

クライアントサイドでの認証状態の変化（ログイン、ログアウト、トークン更新など）を検知し、サーバーコンポーネントと同期させるための `AuthProvider` を実装しました。

---

## 1. 背景と課題

### 課題
Next.js App Router と Supabase を組み合わせた構成において、以下のシナリオでUIの同期ズレが発生する可能性がありました。
1.  **別タブでのログアウト**: ユーザーがタブAでログアウトしたが、タブBではヘッダーが「ログイン済み」のまま残る。
2.  **トークン期限切れ**: アクセストークンの有効期限が切れ、自動リフレッシュが行われた（または失敗した）際に、サーバーコンポーネントが古い状態を参照し続ける。

### 解決策
Supabase の `onAuthStateChange` イベントを監視するクライアントコンポーネント (`AuthProvider`) を導入し、認証状態に変化があった場合に `router.refresh()` を実行してサーバーコンポーネントを再レンダリングさせます。

---

## 2. 実装内容

### 新規コンポーネント
**`src/components/providers/AuthProvider.tsx`**
*   `useClient` ディレクティブを使用したクライアントコンポーネント。
*   `useEffect` 内で `supabase.auth.onAuthStateChange` を購読。
*   `SIGNED_IN` または `SIGNED_OUT` イベント発生時に `router.refresh()` を実行。

### アプリケーションへの統合
**`src/app/layout.tsx`**
*   `RootLayout` 内で、ヘッダーやメインコンテンツを含む全体を `AuthProvider` でラップ。
*   これにより、アプリ全体で認証状態の同期が有効になります。

---

## 3. 技術的な詳細

```tsx
// src/components/providers/AuthProvider.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <>{children}</>;
}
```

## 今後の展望
*   必要に応じて、ユーザー情報を Context で配信する機能を追加することも可能ですが、現在は Server Actions と Server Components で完結しているため、同期機能のみを提供しています。
