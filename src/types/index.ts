/**
 * 共通型定義
 *
 * プロジェクト全体で使用する型を定義します
 */

/**
 * API レスポンスの基本型
 */
export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    message: string;
    code?: string;
  };
};

/**
 * ページネーション情報
 */
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/**
 * ソート情報
 */
export type SortOrder = "asc" | "desc";

/**
 * 日付範囲
 */
export type DateRange = {
  from: Date;
  to: Date;
};

/**
 * 読み込み状態
 */
export type LoadingState = "idle" | "loading" | "success" | "error";
