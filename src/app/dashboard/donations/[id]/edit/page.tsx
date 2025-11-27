import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DonationEditForm } from "@/components/donations/DonationEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getReturnItemCategories, getReturnItemSubcategories } from "@/lib/supabase/queries";
import type { Donation } from "@/types/database.types";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDonationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 寄付記録を取得
  const { data: donation } = (await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()) as { data: Donation | null };

  if (!donation) {
    redirect("/dashboard/donations");
  }

  const [categories, subcategories] = await Promise.all([
    getReturnItemCategories(supabase),
    getReturnItemSubcategories(supabase),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link href="/dashboard/donations" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              寄付記録一覧に戻る
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
              <Pencil className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                寄付記録の編集
              </h1>
              <p className="text-muted-foreground mt-1.5">
                登録済みの寄付情報を更新します
              </p>
            </div>
          </div>
        </div>

        {/* 寄付記録編集フォーム */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-150">
          <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800/50">
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">寄付情報</CardTitle>
            <CardDescription>
              登録済みのふるさと納税記録を編集できます
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <DonationEditForm donation={donation} categories={categories} subcategories={subcategories} />
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-300">
          <div className="flex gap-3">
            <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0 h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              <span className="font-semibold block mb-1">変更の反映について</span>
              変更内容は即座に反映されます。金額や日付などの重要な情報は、正確に入力してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
