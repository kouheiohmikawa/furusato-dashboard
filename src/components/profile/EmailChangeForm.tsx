"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { changeEmail } from "@/app/actions/auth";

type EmailChangeFormProps = {
  currentEmail: string;
};

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await changeEmail(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "メールアドレスの変更リクエストを送信しました");
        // フォームをリセット（エラーが出ても無視）
        try {
          event.currentTarget.reset();
        } catch (resetError) {
          // フォームリセットの失敗は無視
          console.warn("Form reset failed:", resetError);
        }
        // フォームを折りたたむ
        setTimeout(() => {
          setIsExpanded(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Email change error:", err);
      setError("メールアドレスの変更に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isExpanded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              メールアドレス
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{currentEmail}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            変更する
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
          <Shield className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            メールアドレスの変更
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            セキュリティのため、現在のパスワードの入力が必要です
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsExpanded(false);
            setError(null);
            setSuccess(null);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          キャンセル
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* エラーメッセージ */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
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
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
            </div>
          </div>
        )}

        {/* 現在のメールアドレス */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">現在のメールアドレス</Label>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800">
            {currentEmail}
          </div>
        </div>

        {/* 現在のパスワード */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-sm font-medium">
            現在のパスワード <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="pl-10 h-11 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* 新しいメールアドレス */}
        <div className="space-y-2">
          <Label htmlFor="newEmail" className="text-sm font-medium">
            新しいメールアドレス <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              placeholder="new@example.com"
              required
              disabled={isLoading}
              className="pl-10 h-11 bg-white dark:bg-slate-900"
            />
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            確認メールが新しいアドレスに送信されます
          </p>
        </div>

        {/* 変更ボタン */}
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">処理中...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              メールアドレスを変更する
            </>
          )}
        </Button>
      </form>

      {/* 注意事項 */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-blue-200 dark:border-blue-900/50">
        <p className="font-medium text-slate-700 dark:text-slate-300">変更の流れ：</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>新しいメールアドレスに確認メールが送信されます</li>
          <li>メール内のリンクをクリックして変更を確定します</li>
          <li>確定するまで現在のメールアドレスが有効です</li>
        </ol>
      </div>
    </div>
  );
}
