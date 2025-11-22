import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DonationStatistics } from "@/components/dashboard/DonationStatistics";
import type { Donation } from "@/types/database.types";

export default async function StatisticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 寄付記録を取得
  const { data: donations } = (await supabase
    .from("donations")
    .select("*")
    .eq("user_id", user.id)
    .order("donation_date", { ascending: false })) as { data: Donation[] | null };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            詳しいデータ
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            グラフで寄付の内訳を確認
          </p>
        </div>

        {/* Statistics Component */}
        <DonationStatistics donations={donations || []} />
      </div>
    </div>
  );
}
