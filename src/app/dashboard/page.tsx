import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Heart, Plus, TrendingUp, ArrowRight, Home } from "lucide-react";
import { DonationOverview } from "@/components/dashboard/DonationOverview";
import { UserMenu } from "@/components/dashboard/UserMenu";
import Link from "next/link";
import type { Profile, Donation, SimulationHistory } from "@/types/database.types";

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

  // 寄付記録を取得
  const { data: donations } = (await supabase
    .from("donations")
    .select("*")
    .eq("user_id", user.id)
    .order("donation_date", { ascending: false })) as { data: Donation[] | null };

  // シミュレーション履歴から最新の結果を取得
  const { data: latestSimulation } = (await supabase
    .from("simulation_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SimulationHistory | null };

  // 推定上限額を取得（シミュレーション結果から）
  const estimatedLimit = latestSimulation
    ? (latestSimulation.result_data as { estimatedLimit?: number })?.estimatedLimit
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                トップ
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ダッシュボード
            </h1>
          </div>
          <UserMenu user={user} profile={profile} />
        </div>

        {/* 寄付概要 - 最重要セクション */}
        <DonationOverview donations={donations || []} estimatedLimit={estimatedLimit} />

        {/* クイックアクション - 大きく目立たせる */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/simulator">
            <Card className="border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:border-primary transition-all hover:shadow-lg cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">控除額シミュレーター</CardTitle>
                      <CardDescription className="mt-1">
                        今年の上限額を確認
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/donations/add">
            <Card className="border-2 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background hover:border-emerald-500 transition-all hover:shadow-lg cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">寄付を登録</CardTitle>
                      <CardDescription className="mt-1">
                        新しい寄付記録を追加
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* サブメニュー */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/donations">
            <Card className="border hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">寄付記録一覧</CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardDescription className="text-sm">
                  すべての寄付を確認・編集
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/history">
            <Card className="border hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">シミュレーション履歴</CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardDescription className="text-sm">
                  過去の計算結果を確認
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
