/**
 * Supabase サーバークライアント（Server Components / Server Actions用）
 *
 * Server ComponentsやServer Actionsで使用するSupabaseクライアント。
 * クッキーを使用して認証状態を管理します。
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  // 環境変数のチェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
    throw new Error('Supabase environment variables are not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase] Creating client with URL:', supabaseUrl);
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Componentからのset操作は無視
            // Middlewareで処理される
          }
        },
      },
    }
  );
}
