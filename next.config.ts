import type { NextConfig } from "next";

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

export default nextConfig;
