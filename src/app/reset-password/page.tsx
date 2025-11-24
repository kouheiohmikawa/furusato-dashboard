"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await resetPassword(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "メールを送信しました");
        // フォームをリセット（エラーが出ても無視）
        try {
          event.currentTarget.reset();
        } catch (resetError) {
          // フォームリセットの失敗は無視
          console.warn("Form reset failed:", resetError);
        }
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("メール送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            パスワードをリセット
          </h1>
          <p className="text-muted-foreground">
            登録したメールアドレスにリセット用のリンクを送信します
          </p>
        </div>

        {/* パスワードリセットフォーム */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">パスワードリセット</CardTitle>
            <CardDescription>
              メールアドレスを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* エラーメッセージ */}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* 成功メッセージ */}
              {success && (
                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {success}
                    </p>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                      メールに記載されているリンクをクリックして、新しいパスワードを設定してください。
                    </p>
                  </div>
                </div>
              )}

              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 送信ボタン */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">送信中...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    リセットメールを送信
                  </>
                )}
              </Button>
            </form>

            {/* ログインに戻る */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ログインページに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
