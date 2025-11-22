import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Calculator, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { SimulationHistory } from "@/types/database.types";
import { SimulationHistoryList } from "@/components/simulation/SimulationHistoryList";

export default async function SimulationHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // シミュレーション履歴を取得
  const { data: simulations } = (await supabase
    .from("simulation_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: SimulationHistory[] | null };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              シミュレーション履歴
            </h1>
          </div>
          <p className="text-muted-foreground">
            過去に計算したシミュレーション結果を確認できます
          </p>
        </div>

        {/* 新規シミュレーションボタン */}
        <div className="mb-6">
          <Link href="/simulator">
            <Button className="w-full sm:w-auto">
              <Calculator className="mr-2 h-5 w-5" />
              新しいシミュレーションを実行
            </Button>
          </Link>
        </div>

        {/* 履歴リスト */}
        {simulations && simulations.length > 0 ? (
          <SimulationHistoryList simulations={simulations} />
        ) : (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>履歴がありません</CardTitle>
              <CardDescription>
                まだシミュレーション結果が保存されていません
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                シミュレーターで計算した結果を保存すると、ここに履歴が表示されます
              </p>
              <Link href="/simulator">
                <Button>
                  <Calculator className="mr-2 h-5 w-5" />
                  シミュレーターへ
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
