/**
 * Sentry Edge Runtime設定
 *
 * ミドルウェアで発生したエラーをSentryに送信します。
 * 環境変数NEXT_PUBLIC_SENTRY_DSNが設定されていない場合、Sentryは無効化されます。
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// DSNが設定されている場合のみSentryを初期化
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // パフォーマンスモニタリング
    tracesSampleRate: 1.0,

    // デバッグモード（開発環境のみ）
    debug: process.env.NODE_ENV === "development",

    // 環境名
    environment: process.env.NODE_ENV,
  });
} else {
  console.info("Sentry is disabled (NEXT_PUBLIC_SENTRY_DSN not set)");
}
