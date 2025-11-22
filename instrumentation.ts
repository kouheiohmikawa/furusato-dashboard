/**
 * Next.js Instrumentation
 *
 * アプリケーション起動時に実行される処理。
 * Sentryの初期化に使用されます。
 */

export async function register() {
  // サーバーサイドでのみ実行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Edge Runtime（middleware）でのみ実行
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
