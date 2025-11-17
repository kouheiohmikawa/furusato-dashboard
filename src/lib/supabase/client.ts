/**
 * Supabase クライアント（ブラウザ用）
 *
 * Client Componentsで使用するSupabaseクライアント。
 * ブラウザ環境でのみ動作し、クライアントサイドでの認証状態管理を行います。
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
