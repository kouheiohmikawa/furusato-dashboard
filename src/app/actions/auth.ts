"use server";

/**
 * 認証関連のServer Actions
 *
 * ログイン、サインアップ、ログアウト、パスワードリセットなどの
 * サーバーサイド処理を行います。
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabaseのエラーメッセージを日本語に変換
 */
function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません",
    "Email not confirmed": "メールアドレスが確認されていません。確認メールをご確認ください",
    "User already registered": "このメールアドレスは既に登録されています",
    "Password should be at least 6 characters": "パスワードは6文字以上で入力してください",
    "Unable to validate email address: invalid format": "メールアドレスの形式が正しくありません",
    "Email rate limit exceeded": "メール送信の制限を超えました。しばらく待ってから再度お試しください",
    "For security purposes, you can only request this once every 60 seconds": "セキュリティのため、60秒に1回のみリクエスト可能です",
    "User not found": "ユーザーが見つかりません",
    "New password should be different from the old password": "新しいパスワードは現在のパスワードと異なるものを設定してください",
    "Password is too weak": "パスワードが弱すぎます。より強力なパスワードを設定してください",
  };

  // 完全一致を試す
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // 部分一致を試す
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // マッピングが見つからない場合はデフォルトメッセージ
  return "エラーが発生しました。もう一度お試しください";
}

/**
 * ログイン処理
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * 新規登録処理
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/auth/callback`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success: true,
    message: "確認メールを送信しました。メールボックスをご確認ください。"
  };
}

/**
 * ログアウト処理
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * パスワードリセットメール送信
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/auth/reset-password`,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success: true,
    message: "パスワードリセット用のメールを送信しました。",
  };
}

/**
 * パスワード更新処理
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
