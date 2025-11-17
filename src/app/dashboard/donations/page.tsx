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
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  寄付記録一覧
                </h1>
                <p className="text-muted-foreground mt-1">
                  ふるさと納税の寄付履歴を管理
                </p>
              </div>
            </div>
            <Link href="/dashboard/donations/add">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                新規登録
              </Button>
            </Link>
          </div>
        </div>

        {/* 寄付記録リスト */}
        <DonationList donations={donations || []} />
      </div>
    </div>
  );
}
