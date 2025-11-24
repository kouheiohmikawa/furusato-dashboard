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
  changeEmailSchema,
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
    "A user with this email address has already been registered": "このメールアドレスは既に他のアカウントで使用されています",
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
    // 入力値のバリデーション
    const validationResult = loginSchema.safeParse({
      email: getFormValue(formData, "email"),
      password: formData.get("password") as string, // パスワードはサニタイズ不要
      redirect: getFormValue(formData, "redirect", false) || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const { email, password, redirect: redirectTo } = validationResult.data;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    revalidatePath("/", "layout");
    // リダイレクト先が指定されている場合はそこへ、なければダッシュボードへ
    redirect(redirectTo || "/dashboard");
  } catch (error) {
    // Next.jsのredirect()は正常動作でエラーをthrowするため、それは再スロー
    if (error && typeof error === 'object' && 'digest' in error) {
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
    // 入力値のバリデーション
    const validationResult = resetPasswordRequestSchema.safeParse({
      email: getFormValue(formData, "email"),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const { email } = validationResult.data;

    const supabase = await createClient();

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

/**
 * メールアドレス変更処理
 */
export async function changeEmail(formData: FormData) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Change Email] Starting email change process");
    }

    // 入力値のバリデーション
    const validationResult = changeEmailSchema.safeParse({
      currentPassword: formData.get("currentPassword") as string,
      newEmail: getFormValue(formData, "newEmail"),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      if (process.env.NODE_ENV === 'development') {
        console.log("[Change Email] Validation failed:", firstError.message);
      }
      return { error: firstError.message };
    }

    const { currentPassword, newEmail } = validationResult.data;

    const supabase = await createClient();

    // 1. 現在のユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Change Email] User not found");
      }
      return { error: "ユーザー情報の取得に失敗しました" };
    }

    const currentEmail = user.email;

    if (!currentEmail) {
      return { error: "現在のメールアドレスが見つかりません" };
    }

    // 新しいメールアドレスが現在のものと同じかチェック
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      return { error: "新しいメールアドレスは現在のものと異なる必要があります" };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Change Email] Verifying password for:", currentEmail);
    }

    // 2. 現在のパスワードで本人確認
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    if (verifyError) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Change Email] Password verification failed:", verifyError.message);
      }
      return { error: "現在のパスワードが正しくありません" };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Change Email] Updating email to:", newEmail);
    }

    // 3. メールアドレス変更リクエスト
    // Supabaseが自動的に新しいメールアドレスに確認メールを送信
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Change Email] Update failed:", updateError.message);
      }
      return { error: translateAuthError(updateError.message) };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("[Change Email] Email change request successful");
    }

    revalidatePath("/dashboard/profile", "page");

    return {
      success: true,
      message: `新しいメールアドレス（${newEmail}）に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。`,
    };
  } catch (error) {
    console.error("[Change Email Error]", error);
    return {
      error: "メールアドレスの変更に失敗しました。もう一度お試しください。",
    };
  }
}
