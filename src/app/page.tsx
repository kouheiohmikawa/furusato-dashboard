import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calculator, ClipboardList, Bell, BarChart3, Save, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* 背景装飾 */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-transparent dark:from-blue-950/30 dark:via-indigo-950/10 dark:to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-24 text-center lg:py-32 relative">
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-blue-900 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 fill-blue-600/20" />
            <span>完全無料で使えるふるさと納税管理ツール</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl text-slate-900 dark:text-slate-100 leading-tight">
            ふるさと納税を
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent pb-2 inline-block">
              もっとシンプルに
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl leading-relaxed">
            控除額のシミュレーションから寄付の管理まで。<br className="hidden sm:block" />
            複数のポータルサイトをまたいだ寄付状況を、ひとつのダッシュボードで一元管理。
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-6">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 text-xl rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
              <Link href="/simulator">
                <Calculator className="mr-2 h-6 w-6" />
                シミュレーションを始める
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link href="/login">
                  ログイン
                </Link>
              </Button>
              <span className="text-slate-200 dark:text-slate-800 h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <Button asChild variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700">
                <Link href="/signup">
                  <Sparkles className="mr-2 h-4 w-4" />
                  新規登録
                </Link>
              </Button>
            </div>
          </div>


        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100 mb-4">主な機能</h2>
            <p className="text-lg text-muted-foreground">
              ふるさと納税をもっと便利に、もっと簡単にするための機能を揃えました
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {/* 機能1: シミュレーター */}
            <Card className="group relative overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute right-4 top-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                  登録不要
                </Badge>
              </div>
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold">かんたんシミュレーション</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  年収や家族構成を入力するだけで、控除上限額の目安をすぐに計算。
                  面倒な計算は一切不要です。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 機能2: 一元管理 */}
            <Card className="group relative overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="border-slate-200 dark:border-slate-700">会員限定</Badge>
              </div>
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold">複数ポータル一元管理</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  楽天、ふるなび、さとふるなど、複数のポータルサイトでの寄付履歴を
                  ひとつの場所でまとめて管理できます。
                </CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>
      </section>

      {/* 会員登録のメリットセクション */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>会員登録でさらに便利に</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100 mb-4">
              無料アカウントでできること
            </h2>
            <p className="text-lg text-muted-foreground">
              メールアドレスだけで簡単登録。すべての機能が完全無料で使えます
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Save className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">シミュレーション結果を保存</CardTitle>
                </div>
                <CardDescription className="text-base pl-16">
                  計算した控除上限額を保存して、いつでも確認。
                  過去の結果と比較して、最適な寄付額を見つけられます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">寄付記録を一元管理</CardTitle>
                </div>
                <CardDescription className="text-base pl-16">
                  すべての寄付をひとつの場所で管理。
                  自治体名、金額、返礼品、受領番号などを詳細に記録できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">年度別の統計表示</CardTitle>
                </div>
                <CardDescription className="text-base pl-16">
                  年度ごとの寄付総額や件数を自動集計。
                  控除上限額と比較して、残り枠を一目で確認できます。
                </CardDescription>
              </CardHeader>
            </Card>

          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <Link href="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                無料でアカウントを作成する
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              クレジットカード登録不要・1分で完了
            </p>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative space-y-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              まずはシミュレーションから
            </h2>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              会員登録なしで、すぐに控除額の目安を確認できます。
              あなたに最適なふるさと納税額を見つけましょう。
            </p>
            <div className="pt-2">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link href="/simulator">
                  <Calculator className="mr-2 h-5 w-5" />
                  無料でシミュレーションする
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100">
              よくある質問
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {[
              {
                q: "会員登録しなくても使えますか？",
                a: "はい、控除額シミュレーションは会員登録不要でご利用いただけます。寄付の記録や詳細な管理機能をご利用の場合は、無料の会員登録が必要です。"
              },
              {
                q: "シミュレーション結果は正確ですか？",
                a: "簡易的な計算による目安です。住宅ローン控除や医療費控除など、他の控除がある場合は実際の上限額が変動します。正確な金額は、源泉徴収票や確定申告書類をもとに計算してください。"
              },
              {
                q: "料金はかかりますか？",
                a: "現在、すべての機能を完全無料でご利用いただけます。追加料金や課金要素は一切ありません。"
              }
            ].map((faq, index) => (
              <Card key={index} className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400">Q.</span>
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-8 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">A.</span>
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
