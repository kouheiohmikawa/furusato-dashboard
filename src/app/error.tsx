"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログをコンソールに出力（本番環境では外部サービスに送信することも可能）
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl">
      <Card className="border-destructive">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">エラーが発生しました</CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-7xl font-bold text-red-500/20">500</p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message || "不明なエラーが発生しました"}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  エラーID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              一時的な問題の可能性があります。以下をお試しください：
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-2">
              <li>ページを再読み込みする</li>
              <li>しばらく時間をおいて再度アクセスする</li>
              <li>
                問題が解決しない場合は、
                <a
                  href="mailto:support@example.com"
                  className="text-primary hover:underline ml-1"
                >
                  お問い合わせ
                </a>
                ください
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} className="flex-1">
              もう一度試す
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">ホームに戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
