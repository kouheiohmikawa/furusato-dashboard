"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { EmailChangeForm } from "./EmailChangeForm";

type ProfilePageClientProps = {
  email: string;
  displayName: string;
  prefecture: string;
  manualLimit?: number | null;
};

export function ProfilePageClient({
  email,
  displayName,
  prefecture,
  manualLimit,
}: ProfilePageClientProps) {
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  return (
    <>
      {/* 共通アラート表示エリア（ページ最上部） */}
      {alert && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {alert.type === "success" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900 p-4 flex items-start gap-3">
              <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  更新完了
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {alert.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-4 flex items-start gap-3">
              <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {alert.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* メールアドレス変更セクション */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <CardTitle className="text-xl">アカウント情報</CardTitle>
          <CardDescription>
            メールアドレスの変更・管理
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <EmailChangeForm
            currentEmail={email}
            onSuccess={(message) => {
              setAlert({ type: "success", message });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onError={(message) => {
              setAlert({ type: "error", message });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </CardContent>
      </Card>

      {/* プロフィール編集フォーム */}
      <Card className="mt-8 border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <CardTitle className="text-xl">基本情報</CardTitle>
          <CardDescription>
            表示名と都道府県を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProfileForm
            email={email}
            displayName={displayName}
            prefecture={prefecture}
            manualLimit={manualLimit}
            onSuccess={(message) => {
              setAlert({ type: "success", message });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onError={(message) => {
              setAlert({ type: "error", message });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
