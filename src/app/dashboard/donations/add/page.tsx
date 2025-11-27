import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DonationForm } from "@/components/donations/DonationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getReturnItemCategories, getReturnItemSubcategories } from "@/lib/supabase/queries";

export default async function AddDonationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                寄付記録の登録
              </h1>
              <p className="text-muted-foreground mt-1.5">
                新しい寄付記録を登録して、控除額を管理しましょう
              </p>
            </div>
          </div>
        </div>

        {/* 寄付記録登録フォーム */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-150">
          <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800/50">
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">寄付情報</CardTitle>
            <CardDescription>
              ふるさと納税の寄付記録を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <DonationForm categories={categories} subcategories={subcategories} />
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-300">
          <div className="flex gap-3">
            <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0 h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-semibold block mb-1">登録内容について</span>
              登録した寄付記録は、後から編集・削除することができます。
              受領証明書がお手元にある場合は、受領番号も入力しておくと管理が便利です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
