"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * アカウント削除処理
 *
 * ユーザーの全データと認証アカウントを削除します。
 * この操作は取り消せません。
 */
export async function deleteAccount() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "ユーザーが見つかりません" };
        }

        // Adminクライアントを使用してユーザーを削除
        // (auth.usersから削除されると、CASCADE設定によりprofilesやdonationsも削除されるはず)
        // もしCASCADEが設定されていない場合は、手動で削除が必要
        const adminSupabase = createAdminClient();

        // 1. ユーザー削除 (Auth)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            console.error("Account deletion error:", deleteError);
            return { error: "アカウントの削除に失敗しました" };
        }

        // 2. ログアウト処理（セッションクリア）
        await supabase.auth.signOut();

        revalidatePath("/", "layout");
    } catch (error) {
        console.error("Unexpected error during account deletion:", error);
        return { error: "予期せぬエラーが発生しました" };
    }

    // 完了後はログインページへリダイレクト
    redirect("/login?deleted=true");
}
