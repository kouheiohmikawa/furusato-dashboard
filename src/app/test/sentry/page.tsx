"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sentryテストページ
 *
 * このページは開発環境でのみアクセス可能です。
 * 本番環境では404を返します。
 */
export default function SentryTestPage() {
  // 本番環境では404を表示
  if (process.env.NODE_ENV === "production") {
    throw new Error("Not Found");
  }

  const handleClientError = () => {
    try {
      throw new Error("Test: Client-side error from Sentry test page");
    } catch (error) {
      Sentry.captureException(error);
      alert("クライアントエラーをSentryに送信しました！");
    }
  };

  const handleUnhandledError = () => {
    // 未処理エラー（Sentryが自動的にキャッチ）
    throw new Error("Test: Unhandled client-side error");
  };

  const handleServerError = async () => {
    try {
      const response = await fetch("/test/sentry/api");
      const data = await response.json();
      alert(JSON.stringify(data));
    } catch (error) {
      console.error("Server error test failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sentry動作確認ページ</CardTitle>
            <CardDescription>
              開発環境専用 - 各ボタンをクリックしてSentryにエラーを送信
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">1. クライアントエラー（処理済み）</h3>
              <p className="text-sm text-muted-foreground">
                try-catchでキャッチされたエラーを手動でSentryに送信
              </p>
              <Button onClick={handleClientError} variant="outline">
                クライアントエラーをテスト
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">2. クライアントエラー（未処理）</h3>
              <p className="text-sm text-muted-foreground">
                未処理エラーを発生させる（Sentryが自動的にキャッチ）
              </p>
              <Button onClick={handleUnhandledError} variant="destructive">
                未処理エラーをテスト
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">3. サーバーエラー</h3>
              <p className="text-sm text-muted-foreground">
                Server Actionでエラーを発生させる
              </p>
              <Button onClick={handleServerError} variant="secondary">
                サーバーエラーをテスト
              </Button>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm">
                <strong>確認方法:</strong><br />
                1. ボタンをクリック<br />
                2. Sentry Dashboard (https://sentry.io) にアクセス<br />
                3. Issues タブでエラーイベントを確認
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
