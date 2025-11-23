/**
 * Supabase ミドルウェアヘルパー
 *
 * Next.jsミドルウェアで使用するSupabaseクライアント。
 * リクエスト/レスポンス間でクッキーを管理し、セッションを更新します。
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * クライアントIPアドレスを取得
 */
function getClientIp(request: NextRequest): string {
  // Vercel/CloudflareなどのプロキシからIPを取得
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
}

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
          cookiesToSet.forEach(({ name, value }) =>
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
  // 1. レート制限
  // ---------------------------------------------------------
  const url = request.nextUrl.clone();
  const path = url.pathname;
  const clientIp = getClientIp(request);

  // 認証関連エンドポイントのレート制限
  const rateLimitConfig = (() => {
    if (path.startsWith('/login')) return RATE_LIMITS.LOGIN;
    if (path.startsWith('/signup')) return RATE_LIMITS.SIGNUP;
    if (path.startsWith('/reset-password')) return RATE_LIMITS.PASSWORD_RESET;
    // APIルートの保護（将来的に追加する場合）
    if (path.startsWith('/api')) return RATE_LIMITS.API;
    return null;
  })();

  if (rateLimitConfig) {
    const rateLimitKey = `${path}:${clientIp}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, rateLimitConfig);

    if (!rateLimitResult.success) {
      // レート制限超過
      return new NextResponse(
        JSON.stringify({
          error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
          retryAfter: rateLimitResult.resetInSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.resetInSeconds),
            'X-RateLimit-Limit': String(rateLimitConfig.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetInSeconds),
          },
        }
      );
    }
  }

  // ---------------------------------------------------------
  // 2. ルート保護 (アクセス制御)
  // ---------------------------------------------------------
  // 公開ルート（認証不要で常にアクセス可能）
  const publicPaths = ["/", "/auth/callback", "/auth/reset-password", "/monitoring"];
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
  // 3. セキュリティヘッダーの付与
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

  // Content Security Policy (CSP) - XSS攻撃からの防御
  // 注意: 開発環境では一部の機能（HMRなど）が制限される可能性があります
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.jsとTurbopackのため'unsafe-eval'が必要
    "style-src 'self' 'unsafe-inline'", // Tailwind CSSのため'unsafe-inline'が必要
    "img-src 'self' data: https: blob:", // 画像の柔軟な読み込み
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co", // Supabase API接続
    "frame-ancestors 'none'", // X-Frame-Optionsと同等
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  finalResponse.headers.set("Content-Security-Policy", cspDirectives);

  // Supabaseのクッキーをコピー（セッション情報を保持）
  // IMPORTANT: options（HttpOnly, Secure, SameSiteなど）も含めてコピー
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    finalResponse.cookies.set(name, value, options);
  });

  return finalResponse;
}
