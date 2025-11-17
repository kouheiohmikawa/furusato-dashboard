"use server";

/**
 * プロフィール関連のServer Actions
 *
 * プロフィール情報の取得・更新処理を行います。
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * プロフィール更新処理
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const displayName = formData.get("displayName") as string;
  const prefecture = formData.get("prefecture") as string;

  // バリデーション
  if (!displayName || displayName.trim().length === 0) {
    return { error: "表示名を入力してください" };
  }

  if (displayName.length > 50) {
    return { error: "表示名は50文字以内で入力してください" };
  }

  // プロフィール更新
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName.trim(),
      prefecture: prefecture || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { error: "プロフィールの更新に失敗しました" };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");

  return { success: true, message: "プロフィールを更新しました" };
}
