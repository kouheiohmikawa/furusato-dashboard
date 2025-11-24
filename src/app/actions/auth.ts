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
import {
  loginSchema,
  signupSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";
import { getFormValue } from "@/lib/sanitize";

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
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Login] Starting login process");
    }

    // 入力値のバリデーション
    const validationResult = loginSchema.safeParse({
      email: getFormValue(formData, "email"),
      password: formData.get("password") as string, // パスワードはサニタイズ不要
      redirect: getFormValue(formData, "redirect", false) || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      if (process.env.NODE_ENV === 'development') {
        console.log("[Login] Validation failed:", firstError.message);
      }
      return { error: firstError.message };
    }

    const { email, password, redirect: redirectTo } = validationResult.data;
    if (process.env.NODE_ENV === 'development') {
      console.log("[Login] Attempting login for:", email);
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log("[Login] Supabase response:", { error: error?.message, hasSession: !!data?.session });
    }

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Login] Login failed:", error.message);
      }
      return { error: translateAuthError(error.message) };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Login] Login successful, redirecting to:", redirectTo || "/dashboard");
    }
    revalidatePath("/", "layout");
    // リダイレクト先が指定されている場合はそこへ、なければダッシュボードへ
    redirect(redirectTo || "/dashboard");
  } catch (error) {
    // Next.jsのredirect()は正常動作でエラーをthrowするため、それは再スロー
    if (error && typeof error === 'object' && 'digest' in error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Login] Redirecting (normal behavior)");
      }
      throw error;
    }

    // その他のエラーはログに記録して返す
    console.error("[Login Error]", error);
    return {
      error: "ログインに失敗しました。もう一度お試しください。",
    };
  }
}

/**
 * 新規登録処理
 */
export async function signup(formData: FormData) {
  try {
    // 入力値のバリデーション
    const validationResult = signupSchema.safeParse({
      email: getFormValue(formData, "email"),
      password: formData.get("password") as string,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const { email, password } = validationResult.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/auth/callback`,
      },
    });

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('Signup response:', { data, error });
    }

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    // Supabaseは既存ユーザーの場合、errorではなくdata.user.identitiesが空配列になる
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      return {
        error: "このメールアドレスは既に登録されています。ログインしてください。"
      };
    }

    return {
      success: true,
      message: "確認メールを送信しました。メールボックスをご確認ください。"
    };
  } catch (error) {
    console.error("[Signup Error]", error);
    return {
      error: "新規登録に失敗しました。もう一度お試しください。",
    };
  }
}

/**
 * ログアウト処理
 */
export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    // Next.jsのredirect()は正常動作でエラーをthrowするため、それは再スロー
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }

    console.error("[Logout Error]", error);
    // ログアウトエラーは致命的ではないため、リダイレクトを続行
    redirect("/login");
  }
}

/**
 * パスワードリセットメール送信
 */
export async function resetPassword(formData: FormData) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Reset Password] Starting reset password process");
    }

    // 入力値のバリデーション
    const validationResult = resetPasswordRequestSchema.safeParse({
      email: getFormValue(formData, "email"),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      if (process.env.NODE_ENV === 'development') {
        console.log("[Reset Password] Validation failed:", firstError.message);
      }
      return { error: firstError.message };
    }

    const { email } = validationResult.data;
    if (process.env.NODE_ENV === 'development') {
      console.log("[Reset Password] Sending reset email to:", email);
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/auth/reset-password`,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log("[Reset Password] Supabase response:", { error: error?.message });
    }

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Reset Password] Failed:", error.message);
      }
      return { error: translateAuthError(error.message) };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Reset Password] Email sent successfully");
    }
    return {
      success: true,
      message: "パスワードリセット用のメールを送信しました。",
    };
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return {
      error: "パスワードリセットに失敗しました。もう一度お試しください。",
    };
  }
}

/**
 * パスワード更新処理
 */
export async function updatePassword(formData: FormData) {
  try {
    // 入力値のバリデーション
    const validationResult = updatePasswordSchema.safeParse({
      password: formData.get("password") as string,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const { password } = validationResult.data;

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // Next.jsのredirect()は正常動作でエラーをthrowするため、それは再スロー
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }

    console.error("[Update Password Error]", error);
    return {
      error: "パスワード更新に失敗しました。もう一度お試しください。",
    };
  }
}
