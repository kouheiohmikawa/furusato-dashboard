import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DonationList } from "@/components/donations/DonationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Donation } from "@/types/database.types";

export default async function DonationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 寄付記録を取得（新しい順）
  const { data: donations } = (await supabase
    .from("donations")
    .select("*")
    .eq("user_id", user.id)
    .order("donation_date", { ascending: false })) as { data: Donation[] | null };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link href="/dashboard" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20 text-white">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  寄付記録一覧
                </h1>
                <p className="text-muted-foreground mt-1.5">
                  ふるさと納税の寄付履歴を管理・確認できます
                </p>
              </div>
            </div>

            <Link href="/dashboard/donations/add">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-5 w-5" />
                新規登録
              </Button>
            </Link>
          </div>
        </div>

        {/* 寄付記録リスト */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-150">
          <DonationList donations={donations || []} />
        </div>
      </div>
    </div>
  );
}
