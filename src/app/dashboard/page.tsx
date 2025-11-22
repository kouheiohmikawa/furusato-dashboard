import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Heart, Plus, TrendingUp, ArrowRight, LogOut, BarChart3 } from "lucide-react";
import { DonationOverview } from "@/components/dashboard/DonationOverview";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { logout } from "@/app/actions/auth";
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

  // 推定上限額を取得（優先順位: 1.手動設定 > 2.シミュレーション結果）
  const estimatedLimit =
    profile?.manual_limit ?? // 手動設定を最優先
    (latestSimulation
      ? (latestSimulation.result_data as { estimatedLimit?: number })?.estimatedLimit
      : undefined);

  // 上限額の設定元を判定
  const limitSource = profile?.manual_limit
    ? "manual" as const
    : latestSimulation
      ? "simulation" as const
      : "none" as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              ダッシュボード
            </h1>
            <p className="text-muted-foreground text-sm">
              ふるさと納税の状況を一元管理
            </p>
          </div>
          <UserMenu user={user} profile={profile} />
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content - Donation Overview (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            <DonationOverview
              donations={donations || []}
              estimatedLimit={estimatedLimit}
              limitSource={limitSource}
            />
          </div>

          {/* Sidebar - Quick Actions (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-sm">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                クイックアクション
              </h2>
              <div className="grid gap-3">
                <Link href="/simulator">
                  <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">シミュレーター</p>
                        <p className="text-blue-100 text-xs mt-0.5">控除上限額を計算</p>
                      </div>
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                        <Calculator className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
                  </div>
                </Link>

                <Link href="/dashboard/donations/add">
                  <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">寄付を登録</p>
                        <p className="text-emerald-100 text-xs mt-0.5">新しい寄付を記録</p>
                      </div>
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="p-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                  メニュー
                </h2>
                <div className="space-y-1">
                  <Link href="/dashboard/donations">
                    <Button variant="ghost" className="w-full justify-start h-10 font-normal">
                      <Heart className="mr-2 h-4 w-4 text-rose-500" />
                      寄付記録一覧
                      <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground opacity-50" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/history">
                    <Button variant="ghost" className="w-full justify-start h-10 font-normal">
                      <TrendingUp className="mr-2 h-4 w-4 text-amber-500" />
                      シミュレーション履歴
                      <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground opacity-50" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/statistics">
                    <Button variant="ghost" className="w-full justify-start h-10 font-normal">
                      <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                      詳しいデータを見る
                      <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground opacity-50" />
                    </Button>
                  </Link>
                  <form action={logout} className="w-full">
                    <Button type="submit" variant="ghost" className="w-full justify-start h-10 font-normal text-destructive hover:text-destructive hover:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
