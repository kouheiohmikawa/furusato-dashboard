/**
 * Sentry クライアントサイド設定
 *
 * ブラウザで発生したエラーをSentryに送信します。
 * 環境変数NEXT_PUBLIC_SENTRY_DSNが設定されていない場合、Sentryは無効化されます。
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// DSNが設定されている場合のみSentryを初期化
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // パフォーマンスモニタリング
    // 本番環境では10%のトランザクションをサンプリング（コスト削減）
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // デバッグモード（開発環境のみ）
    debug: process.env.NODE_ENV === "development",

    // リリースバージョン（package.jsonから取得）
    // release: process.env.NEXT_PUBLIC_APP_VERSION,

    // 環境名
    environment: process.env.NODE_ENV,

    // エラーフィルタリング
    beforeSend(event, hint) {
      // 開発環境では本番環境ほど厳密にフィルタリングしない
      if (process.env.NODE_ENV === "development") {
        return event;
      }

      // 特定のエラーを無視（例：ネットワークエラー）
      const error = hint.originalException;
      if (error instanceof Error) {
        // ブラウザ拡張機能によるエラーを無視
        if (error.message.includes("chrome-extension://")) {
          return null;
        }
        // ResizeObserverのエラーを無視（無害）
        if (error.message.includes("ResizeObserver loop")) {
          return null;
        }
      }

      return event;
    },

    // パンくずリストの記録（デバッグに役立つ）
    integrations: [
      Sentry.breadcrumbsIntegration({
        console: true, // console.logなどを記録
        dom: true, // DOMイベントを記録
        fetch: true, // fetchリクエストを記録
        history: true, // ページ遷移を記録
        xhr: true, // XHRリクエストを記録
      }),
    ],

    // プライバシー保護: 個人情報をマスク
    // beforeBreadcrumb(breadcrumb) {
    //   if (breadcrumb.category === 'console') {
    //     return null; // コンソールログを送信しない
    //   }
    //   return breadcrumb;
    // },
  });
} else {
  console.info("Sentry is disabled (NEXT_PUBLIC_SENTRY_DSN not set)");
}
