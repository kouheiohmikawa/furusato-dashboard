/**
 * Supabase ミドルウェアヘルパー
 *
 * Next.jsミドルウェアで使用するSupabaseクライアント。
 * リクエスト/レスポンス間でクッキーを管理し、セッションを更新します。
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを更新（トークンのリフレッシュなど）
  // IMPORTANT: getUser()を使用して、JWTを検証する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------------------------------------------------------
  // 1. ルート保護 (アクセス制御)
  // ---------------------------------------------------------
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 公開ルート（認証不要で常にアクセス可能）
  const publicPaths = ["/", "/auth/callback", "/auth/reset-password"];
  const isPublic = publicPaths.some((p) => path.startsWith(p));

  // 保護されたルート（ログインが必要）
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  // 認証ルート（ログイン済みならアクセス不要）
  const authPaths = ["/login", "/signup", "/reset-password"];
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // 未ログインで保護されたルートにアクセスした場合 -> ログインページへ
  if (!user && isProtected && !isPublic) {
    url.pathname = "/login";
    // 元のURLを保存（ログイン後に戻れるように）
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // ログイン済みで認証ルートにアクセスした場合 -> ダッシュボードへ
  if (user && isAuthPath) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ---------------------------------------------------------
  // 2. セキュリティヘッダーの付与
  // ---------------------------------------------------------
  // supabaseResponseから既存ヘッダーを継承
  const finalResponse = NextResponse.next({
    request,
    headers: supabaseResponse.headers,
  });

  // セキュリティヘッダーを追加
  finalResponse.headers.set("X-Frame-Options", "DENY");
  finalResponse.headers.set("X-Content-Type-Options", "nosniff");
  finalResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  finalResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Supabaseのクッキーをコピー（セッション情報を保持）
  // IMPORTANT: options（HttpOnly, Secure, SameSiteなど）も含めてコピー
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    finalResponse.cookies.set(name, value, options);
  });

  return finalResponse;
}
