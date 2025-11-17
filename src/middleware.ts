/**
 * Next.js ミドルウェア
 *
 * すべてのリクエストで実行され、Supabaseのセッション状態を更新します。
 * 認証が必要なページへのアクセス制御も行います。
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除く全てのルートにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - 公開ファイル (robots.txt, sitemap.xmlなど)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
