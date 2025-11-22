import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /**
   * セキュリティヘッダーの設定
   * HTTPS強制とセキュリティ向上のためのヘッダーを追加
   */
  async headers() {
    return [
      {
        // 全てのルートに適用
        source: '/:path*',
        headers: [
          {
            // HSTS (HTTP Strict Transport Security)
            // ブラウザに常にHTTPSを使用するよう強制
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};

// Sentry統合
// NEXT_PUBLIC_SENTRY_DSNが設定されている場合のみSentryを有効化
const sentryConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Sentryの追加設定
      silent: true, // ビルド時のログを抑制
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // ソースマップのアップロード設定
      widenClientFileUpload: true,
      disableLogger: true, // 本番環境でSentryのログを無効化

      // 自動インストルメンテーション
      automaticVercelMonitors: true,
    })
  : nextConfig;

export default sentryConfig;
