"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // パスワード確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "登録が完了しました");
        // フォームをリセット
        form.reset();
      } else {
        // 結果が返ってこない場合（成功したがメッセージがない）
        setSuccess("確認メールを送信しました。メールボックスをご確認ください。");
        form.reset();
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            新規登録
          </h1>
          <p className="text-muted-foreground">
            アカウントを作成して寄付を管理
          </p>
        </div>

        {/* 新規登録フォーム */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">アカウント作成</CardTitle>
            <CardDescription>
              メールアドレスとパスワードで登録
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
                      メールに記載されているリンクをクリックして、アカウントを有効化してください。
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

              {/* パスワード */}
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  6文字以上で設定してください
                </p>
              </div>

              {/* パスワード確認 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 登録ボタン */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">登録中...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    アカウントを作成
                  </>
                )}
              </Button>
            </form>

            {/* ログインリンク */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                すでにアカウントをお持ちの方は
              </p>
              <Link href="/login">
                <Button variant="link" className="text-primary font-semibold">
                  ログインはこちら
                </Button>
              </Link>
            </div>

            {/* トップページに戻る */}
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  トップページに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
