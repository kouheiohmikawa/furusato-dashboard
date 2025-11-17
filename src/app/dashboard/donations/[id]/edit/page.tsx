import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DonationEditForm } from "@/components/donations/DonationEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard/donations">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              寄付記録一覧に戻る
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                寄付記録の編集
              </h1>
              <p className="text-muted-foreground mt-1">
                寄付情報を更新します
              </p>
            </div>
          </div>
        </div>

        {/* 寄付記録編集フォーム */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle>寄付情報</CardTitle>
            <CardDescription>
              登録済みのふるさと納税記録を編集できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonationEditForm donation={donation} />
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>ご注意:</strong> 変更内容は即座に反映されます。正確な情報を入力してください。
          </p>
        </div>
      </div>
    </div>
  );
}
