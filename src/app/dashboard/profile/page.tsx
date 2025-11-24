import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { EmailChangeForm } from "@/components/profile/EmailChangeForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/database.types";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール情報を取得
  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()) as { data: Profile | null };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-block">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-slate-100 dark:hover:bg-slate-800 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                プロフィール編集
              </h1>
              <p className="text-muted-foreground mt-1">
                アカウント情報と設定を管理します
              </p>
            </div>
          </div>
        </div>

        {/* メールアドレス変更セクション */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
            <CardTitle className="text-xl">アカウント情報</CardTitle>
            <CardDescription>
              メールアドレスの変更・管理
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EmailChangeForm currentEmail={user.email || ""} />
          </CardContent>
        </Card>

        {/* プロフィール編集フォーム */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
            <CardTitle className="text-xl">基本情報</CardTitle>
            <CardDescription>
              表示名と都道府県を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ProfileForm
              email={user.email || ""}
              displayName={profile?.display_name || ""}
              prefecture={profile?.prefecture || ""}
              manualLimit={profile?.manual_limit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
