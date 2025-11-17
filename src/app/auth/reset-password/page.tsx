"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // パスワード確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updatePassword(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // 成功時はredirect()が呼ばれるため、ここには到達しない
    } catch (err) {
      // Next.jsのredirect()は正常な動作としてエラーをthrowするため、
      // それ以外のエラーのみ表示する
      if (err && typeof err === 'object' && 'digest' in err) {
        // Next.jsのredirect/notFoundエラーは無視（正常な動作）
        throw err;
      }
      setError("パスワードの更新に失敗しました。もう一度お試しください。");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            新しいパスワードを設定
          </h1>
          <p className="text-muted-foreground">
            新しいパスワードを入力してください
          </p>
        </div>

        {/* パスワード更新フォーム */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">パスワード更新</CardTitle>
            <CardDescription>
              6文字以上のパスワードを設定してください
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

              {/* 新しいパスワード */}
              <div className="space-y-2">
                <Label htmlFor="password">新しいパスワード</Label>
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
              </div>

              {/* パスワード確認 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
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

              {/* 更新ボタン */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">更新中...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    パスワードを更新
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
