/**
 * Server Actions用エラーハンドリング
 *
 * 統一的なエラー処理を提供し、以下を実現します：
 * - ユーザーフレンドリーなエラーメッセージ
 * - 機密情報の漏洩防止
 * - 構造化されたエラーレスポンス
 */

/**
 * Server Actionのレスポンス型
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string };

/**
 * エラー分類
 */
export enum ErrorCategory {
  VALIDATION = "VALIDATION", // 入力検証エラー
  AUTH = "AUTH", // 認証エラー
  PERMISSION = "PERMISSION", // 権限エラー
  NOT_FOUND = "NOT_FOUND", // リソース未発見
  CONFLICT = "CONFLICT", // 競合エラー
  RATE_LIMIT = "RATE_LIMIT", // レート制限
  EXTERNAL = "EXTERNAL", // 外部サービスエラー
  INTERNAL = "INTERNAL", // 内部エラー
}

/**
 * カスタムエラークラス
 */
export class ActionError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory = ErrorCategory.INTERNAL,
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ActionError";
  }
}

/**
 * エラーメッセージのマッピング
 * ユーザーに表示する日本語メッセージ
 */
const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.VALIDATION]: "入力内容に誤りがあります。",
  [ErrorCategory.AUTH]: "認証が必要です。ログインしてください。",
  [ErrorCategory.PERMISSION]: "この操作を実行する権限がありません。",
  [ErrorCategory.NOT_FOUND]: "指定されたデータが見つかりません。",
  [ErrorCategory.CONFLICT]: "データが競合しています。画面を更新してください。",
  [ErrorCategory.RATE_LIMIT]: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
  [ErrorCategory.EXTERNAL]: "外部サービスとの通信でエラーが発生しました。",
  [ErrorCategory.INTERNAL]: "エラーが発生しました。しばらく待ってから再度お試しください。",
};

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
function getErrorMessage(error: unknown): { message: string; category: ErrorCategory } {
  // ActionErrorの場合
  if (error instanceof ActionError) {
    return { message: error.message, category: error.category };
  }

  // 標準エラーの場合
  if (error instanceof Error) {
    // Supabaseエラーの判定
    if (error.message.includes("Invalid login credentials")) {
      return {
        message: "メールアドレスまたはパスワードが正しくありません。",
        category: ErrorCategory.AUTH,
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        message: "メールアドレスが確認されていません。確認メールをご確認ください。",
        category: ErrorCategory.AUTH,
      };
    }
    if (error.message.includes("User already registered")) {
      return {
        message: "このメールアドレスは既に登録されています。",
        category: ErrorCategory.CONFLICT,
      };
    }

    // その他のエラー
    return {
      message: ERROR_MESSAGES[ErrorCategory.INTERNAL],
      category: ErrorCategory.INTERNAL,
    };
  }

  // 不明なエラー
  return {
    message: ERROR_MESSAGES[ErrorCategory.INTERNAL],
    category: ErrorCategory.INTERNAL,
  };
}

/**
 * Server Actionをエラーハンドリングでラップ
 *
 * @param action - Server Action関数
 * @returns エラーハンドリング済みのServer Action
 *
 * @example
 * ```typescript
 * export const myAction = withErrorHandling(async (formData: FormData) => {
 *   // 処理...
 *   return { data: result };
 * });
 * ```
 */
export function withErrorHandling<T, Args extends unknown[]>(
  action: (...args: Args) => Promise<{ data?: T; message?: string }>
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      const result = await action(...args);
      return {
        success: true,
        data: result.data as T,
        message: result.message,
      };
    } catch (error) {
      const { message, category } = getErrorMessage(error);

      // 開発環境ではコンソールにエラーを出力
      if (process.env.NODE_ENV === "development") {
        console.error(`[Server Action Error] ${action.name}:`, error);
      }

      return {
        success: false,
        error: message,
        code: category,
      };
    }
  };
}

/**
 * バリデーションエラーを投げる
 */
export function throwValidationError(message: string): never {
  throw new ActionError(message, ErrorCategory.VALIDATION, 400);
}

/**
 * 認証エラーを投げる
 */
export function throwAuthError(message: string = "認証が必要です"): never {
  throw new ActionError(message, ErrorCategory.AUTH, 401);
}

/**
 * 権限エラーを投げる
 */
export function throwPermissionError(
  message: string = "この操作を実行する権限がありません"
): never {
  throw new ActionError(message, ErrorCategory.PERMISSION, 403);
}

/**
 * NotFoundエラーを投げる
 */
export function throwNotFoundError(message: string = "データが見つかりません"): never {
  throw new ActionError(message, ErrorCategory.NOT_FOUND, 404);
}
