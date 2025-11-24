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
            ふるさと納税管理を
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent pb-2 inline-block">
              もっとスマートに
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl leading-relaxed">
            控除額のシミュレーションから寄付の記録・管理まで。<br className="hidden sm:block" />
            ふるさと納税をもっと便利に、もっと簡単に。
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-6">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 text-xl rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
              <Link href="/simulator">
                <Calculator className="mr-2 h-6 w-6" />
                シミュレーションを始める
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600">
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

          {/* Section 1: Smart Planning */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-slate-100 mb-4">
                賢く計画
              </h2>
              <p className="text-lg text-muted-foreground">
                まずはシミュレーションから。登録なしですぐに始められます。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
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

              {/* 機能: 結果保存 */}
              <Card className="group relative overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="border-slate-200 dark:border-slate-700">無料アカウント</Badge>
                </div>
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <Save className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold">計算結果を保存</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    シミュレーション結果を保存して、いつでも確認。
                    過去のデータと比較して、最適な寄付額を検討できます。
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Section 2: Effortless Management */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-slate-100 mb-4">
                手軽に管理
              </h2>
              <p className="text-lg text-muted-foreground">
                複数のサイトで行った寄付も、これひとつで一元管理。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {/* 機能2: 一元管理 */}
              <Card className="group relative overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="border-slate-200 dark:border-slate-700">無料アカウント</Badge>
                </div>
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold">寄付履歴を一元管理</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    楽天、ふるなび、さとふるなど、複数のポータルサイトでの寄付履歴を
                    ひとつの場所でまとめて管理できます。
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 機能: 統計表示 */}
              <Card className="group relative overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="border-slate-200 dark:border-slate-700">無料アカウント</Badge>
                </div>
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold">グラフで可視化</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    年度ごとの寄付総額や件数を自動集計。
                    控除上限額までの残り枠も一目でわかります。
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="mt-24 text-center">
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
