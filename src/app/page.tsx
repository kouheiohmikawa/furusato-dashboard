import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calculator, ClipboardList, Bell, BarChart3, Save, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            完全無料で使える
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            ふるさと納税を
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              もっとシンプルに
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            控除額のシミュレーションから寄付の管理まで。
            <br />
            複数のポータルをまたいだ寄付状況を一元管理できます。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/simulator">
                <Calculator className="mr-2 h-5 w-5" />
                シミュレーションを始める
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                無料で始める
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            会員登録不要ですぐにシミュレーションできます
          </p>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">主な機能</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              ふるさと納税をもっと便利に、もっと簡単に
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 機能1: シミュレーター */}
            <Card className="relative overflow-hidden">
              <div className="absolute right-4 top-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                  登録不要
                </Badge>
              </div>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>かんたんシミュレーション</CardTitle>
                <CardDescription>
                  年収や家族構成を入力するだけで、控除上限額の目安をすぐに計算。
                  会員登録不要ですぐに使えます。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 機能2: 一元管理 */}
            <Card className="relative overflow-hidden">
              <div className="absolute right-4 top-4">
                <Badge variant="default">会員登録必要</Badge>
              </div>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>複数ポータル一元管理</CardTitle>
                <CardDescription>
                  楽天、ふるなび、さとふるなど、複数のポータルをまたいだ寄付を
                  ひとつのダッシュボードで管理。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 機能3: 手続き管理 */}
            <Card className="relative overflow-hidden">
              <div className="absolute right-4 top-4">
                <Badge variant="default">会員登録必要</Badge>
              </div>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>手続き漏れ防止</CardTitle>
                <CardDescription>
                  ワンストップ特例申請や確定申告のステータスを記録。
                  やり忘れを防いで、確実に控除を受けられます。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 会員登録のメリットセクション */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              会員登録でさらに便利に
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              無料アカウントでできること
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              メールアドレスだけで簡単登録。すべての機能が無料で使えます
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <Save className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">シミュレーション結果を保存</CardTitle>
                </div>
                <CardDescription className="text-base">
                  計算した控除上限額を保存して、いつでも確認。
                  過去の結果と比較して、最適な寄付額を見つけられます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">寄付記録を一元管理</CardTitle>
                </div>
                <CardDescription className="text-base">
                  すべての寄付をひとつの場所で管理。
                  自治体名、金額、返礼品、受領番号などを記録できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">年度別の統計表示</CardTitle>
                </div>
                <CardDescription className="text-base">
                  年度ごとの寄付総額や件数を自動集計。
                  控除上限額と比較して、残り枠を一目で確認できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">手続きステータス管理</CardTitle>
                </div>
                <CardDescription className="text-base">
                  ワンストップ特例や確定申告の進捗を記録。
                  手続き漏れを防いで、確実に控除を受けられます。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                無料でアカウントを作成する
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            まずはシミュレーションから
          </h2>
          <p className="text-lg text-muted-foreground">
            会員登録なしで、すぐに控除額の目安を確認できます。
            <br />
            あなたに最適なふるさと納税額を見つけましょう。
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/simulator">無料でシミュレーションする</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              よくある質問
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Q. 会員登録しなくても使えますか？
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A. はい、控除額シミュレーションは会員登録不要でご利用いただけます。
                  寄付の記録や詳細な管理機能をご利用の場合は、会員登録が必要です。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Q. シミュレーション結果は正確ですか？
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A.
                  簡易的な計算による目安です。住宅ローン控除や医療費控除など、他の控除がある場合は
                  実際の上限額が変動します。正確な金額は、源泉徴収票や確定申告書類をもとに
                  計算してください。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q. 料金はかかりますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A.
                  現在、すべての機能を無料でご利用いただけます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
