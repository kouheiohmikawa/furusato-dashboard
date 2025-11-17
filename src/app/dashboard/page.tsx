import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Heart, History, User, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import type { Profile } from "@/types/database.types";

export default async function DashboardPage() {
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
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              ダッシュボード
            </h1>
            <p className="text-muted-foreground mt-2">
              こんにちは、{profile?.display_name || "ユーザー"}さん
            </p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </form>
        </div>

        {/* メニューカード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* プロフィール */}
          <Link href="/dashboard/profile">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">プロフィール</CardTitle>
                <CardDescription>
                  アカウント情報の確認・編集
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  表示名や都道府県などの設定
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 寄付記録 */}
          <Link href="/dashboard/donations">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">寄付記録</CardTitle>
                <CardDescription>
                  寄付履歴の管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  寄付の登録、編集、削除、集計
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* シミュレーション履歴 */}
          <Link href="/dashboard/history">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">シミュレーション履歴</CardTitle>
                <CardDescription>
                  過去の計算結果を確認
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  保存したシミュレーション結果の閲覧
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* クイックアクション */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">クイックアクション</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/simulator">
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    控除額シミュレーター
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ふるさと納税の控除上限額を計算
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/donations/new">
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    寄付を登録
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    新しい寄付記録を追加
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* アカウント情報 */}
        <div className="mt-12">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">メールアドレス</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">表示名</span>
                <span className="font-medium">
                  {profile?.display_name || "未設定"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">都道府県</span>
                <span className="font-medium">
                  {profile?.prefecture || "未設定"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
