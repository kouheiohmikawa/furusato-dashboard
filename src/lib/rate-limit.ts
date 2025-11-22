/**
 * シンプルなメモリベースのレート制限
 *
 * 注意: 複数のサーバーインスタンスでは共有されません。
 * 本番環境でスケールする場合は、Vercel KVやRedisへの移行を推奨します。
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// メモリストア（開発・小規模本番用）
const store = new Map<string, RateLimitEntry>();

// 定期的に期限切れエントリをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

export interface RateLimitConfig {
  /**
   * 許可するリクエスト数
   */
  limit: number;
  /**
   * ウィンドウ時間（ミリ秒）
   */
  window: number;
}

export interface RateLimitResult {
  /**
   * リクエストが許可されたか
   */
  success: boolean;
  /**
   * 残りリクエスト数
   */
  remaining: number;
  /**
   * リセットまでの時間（秒）
   */
  resetInSeconds: number;
}

/**
 * レート制限をチェック
 *
 * @param identifier - 識別子（IPアドレス、ユーザーID等）
 * @param config - レート制限設定
 * @returns レート制限結果
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // 新規または期限切れ
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.window;
    store.set(identifier, { count: 1, resetTime });

    return {
      success: true,
      remaining: config.limit - 1,
      resetInSeconds: Math.ceil(config.window / 1000),
    };
  }

  // カウント増加
  entry.count++;

  // 制限超過
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // 許可
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * 特定の識別子のレート制限をリセット
 * （テストやログイン成功時など）
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * レート制限プリセット
 */
export const RATE_LIMITS = {
  /**
   * ログイン試行: 5回/分
   */
  LOGIN: {
    limit: 5,
    window: 60 * 1000, // 1分
  },
  /**
   * パスワードリセット: 3回/分
   */
  PASSWORD_RESET: {
    limit: 3,
    window: 60 * 1000,
  },
  /**
   * 一般API: 100回/分
   */
  API: {
    limit: 100,
    window: 60 * 1000,
  },
  /**
   * サインアップ: 3回/時間
   */
  SIGNUP: {
    limit: 3,
    window: 60 * 60 * 1000, // 1時間
  },
} as const;
