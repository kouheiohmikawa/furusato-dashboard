import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                プロフィール編集
              </h1>
              <p className="text-muted-foreground mt-1">
                アカウント情報を更新できます
              </p>
            </div>
          </div>
        </div>

        {/* プロフィール編集フォーム */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              表示名と都道府県を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              email={user.email || ""}
              displayName={profile?.display_name || ""}
              prefecture={profile?.prefecture || ""}
              manualLimit={profile?.manual_limit}
            />
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>ご注意:</strong> メールアドレスの変更はセキュリティ上の理由により現在サポートしていません。
          </p>
        </div>
      </div>
    </div>
  );
}
