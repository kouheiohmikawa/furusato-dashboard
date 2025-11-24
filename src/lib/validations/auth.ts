/**
 * 認証関連のバリデーションスキーマ
 *
 * Zodを使用した型安全な入力検証とエラーメッセージの日本語化
 */

import { z } from "zod";

/**
 * メールアドレスのバリデーション
 */
export const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .email("正しいメールアドレスの形式で入力してください")
  .max(255, "メールアドレスは255文字以内で入力してください")
  .trim()
  .toLowerCase();

/**
 * パスワードのバリデーション
 * - 最小6文字（Supabaseの要件）
 * - 最大72文字（bcryptの制限）
 * - 推奨: 英数字を含む
 */
export const passwordSchema = z
  .string()
  .min(6, "パスワードは6文字以上で入力してください")
  .max(72, "パスワードは72文字以内で入力してください")
  .refine(
    (password) => {
      // 最低限の強度チェック：英字と数字の両方を含むことを推奨
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      return hasLetter && hasNumber;
    },
    {
      message: "パスワードは英字と数字を両方含めてください",
    }
  );

/**
 * 新規パスワード（より厳格）
 */
export const newPasswordSchema = z
  .string()
  .min(8, "新しいパスワードは8文字以上で入力してください")
  .max(72, "パスワードは72文字以内で入力してください")
  .refine(
    (password) => {
      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      // 小文字、大文字、数字、特殊文字のうち3種類以上
      const strength = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;
      return strength >= 3;
    },
    {
      message: "パスワードは小文字、大文字、数字、記号のうち3種類以上を含めてください",
    }
  );

/**
 * ログインフォームのスキーマ
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
  redirect: z.string().optional(),
});

/**
 * サインアップフォームのスキーマ
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * パスワードリセット要求のスキーマ
 */
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

/**
 * パスワード更新のスキーマ
 */
export const updatePasswordSchema = z.object({
  password: newPasswordSchema,
});

/**
 * メールアドレス変更のスキーマ
 */
export const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newEmail: emailSchema,
});

/**
 * 型エクスポート
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
