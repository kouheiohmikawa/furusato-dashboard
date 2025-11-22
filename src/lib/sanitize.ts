/**
 * 入力サニタイゼーション
 *
 * XSS攻撃を防ぐためのHTML/スクリプトの除去と
 * 安全な文字列への変換
 */

/**
 * HTMLタグとスクリプトを除去
 *
 * @param input - サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input;

  return (
    input
      // HTMLタグを除去
      .replace(/<[^>]*>/g, "")
      // スクリプトタグとその中身を除去
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // styleタグを除去
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // イベントハンドラーを除去
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
      // javascriptプロトコルを除去
      .replace(/javascript:/gi, "")
      // 連続する空白を1つに
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * HTMLエンティティをエスケープ
 *
 * @param input - エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeHtml(input: string): string {
  if (!input) return input;

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * SQLインジェクション対策用のエスケープ
 * 注意: Supabaseは内部的にパラメータ化クエリを使用するため、
 * これは追加の保護層として機能します
 *
 * @param input - エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeSql(input: string): string {
  if (!input) return input;

  return input
    .replace(/'/g, "''") // シングルクォートをエスケープ
    .replace(/;/g, "") // セミコロンを除去
    .replace(/--/g, "") // コメントを除去
    .replace(/\/\*/g, "") // マルチラインコメント開始を除去
    .replace(/\*\//g, ""); // マルチラインコメント終了を除去
}

/**
 * 安全な文字列への変換
 * - HTMLタグの除去
 * - 特殊文字のエスケープ
 * - 空白の正規化
 *
 * @param input - サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeString(input: string): string {
  if (!input) return input;

  let sanitized = sanitizeHtml(input);
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * FormDataから安全に値を取得
 *
 * @param formData - FormDataオブジェクト
 * @param key - 取得するキー
 * @param sanitize - サニタイズを行うか（デフォルト: true）
 * @returns 安全な文字列
 */
export function getFormValue(
  formData: FormData,
  key: string,
  sanitize: boolean = true
): string {
  const value = formData.get(key) as string | null;

  if (!value) return "";

  return sanitize ? sanitizeString(value) : value;
}

/**
 * FormDataから数値を安全に取得
 *
 * @param formData - FormDataオブジェクト
 * @param key - 取得するキー
 * @returns 数値またはundefined
 */
export function getFormNumber(
  formData: FormData,
  key: string
): number | undefined {
  const value = formData.get(key) as string | null;

  if (!value) return undefined;

  const sanitized = sanitizeString(value);
  const num = Number(sanitized);

  return isNaN(num) ? undefined : num;
}

/**
 * テキストフィールド用のサニタイゼーション
 * - 備考欄など、ある程度自由な入力を許可する場合
 * - ただしスクリプトは除去
 *
 * @param input - サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeTextarea(input: string): string {
  if (!input) return input;

  return (
    input
      // スクリプトタグとその中身を除去
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // イベントハンドラーを除去
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      // javascriptプロトコルを除去
      .replace(/javascript:/gi, "")
      .trim()
  );
}

/**
 * 数値のみを抽出
 *
 * @param input - 入力文字列
 * @returns 数値のみの文字列
 */
export function extractNumbers(input: string): string {
  if (!input) return "";
  return input.replace(/[^0-9]/g, "");
}

/**
 * 英数字とハイフン、アンダースコアのみを許可
 * （受領番号など）
 *
 * @param input - 入力文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeAlphanumeric(input: string): string {
  if (!input) return "";
  return input.replace(/[^a-zA-Z0-9\-_]/g, "").trim();
}
