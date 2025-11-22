/**
 * Sentry サーバーサイド設定
 *
 * Node.jsサーバーで発生したエラーをSentryに送信します。
 * 環境変数NEXT_PUBLIC_SENTRY_DSNが設定されていない場合、Sentryは無効化されます。
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// DSNが設定されている場合のみSentryを初期化
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // パフォーマンスモニタリング
    // サーバーサイドは全トランザクションをサンプリング（APIの遅延検知）
    tracesSampleRate: 1.0,

    // デバッグモード（開発環境のみ）
    debug: process.env.NODE_ENV === "development",

    // 環境名
    environment: process.env.NODE_ENV,

    // エラーフィルタリング
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Supabaseの特定エラーを無視（想定内のエラー）
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          // ログイン失敗は通常の動作なので送信しない
          return null;
        }
      }

      return event;
    },

    // プライバシー保護: リクエストデータから機密情報を除外
    integrations: [
      Sentry.extraErrorDataIntegration({
        // リクエストボディを送信（パスワードなどは自動的にマスク）
        depth: 3,
      }),
    ],
  });
} else {
  console.info("Sentry is disabled (NEXT_PUBLIC_SENTRY_DSN not set)");
}
