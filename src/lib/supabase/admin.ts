import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Supabase Admin Client
 *
 * サーバーサイドでのみ使用可能な特権クライアント。
 * ユーザー削除などの管理者操作に使用します。
 *
 * 注意: このクライアントはクライアントサイドでは絶対に使用しないでください。
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }

    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
