import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            ふるさと納税を
            <br />
            <span className="text-primary">もっとシンプルに</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            控除額のシミュレーションから寄付の管理まで。
            <br />
            複数のポータルをまたいだ寄付状況を一元管理できます。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/simulator">シミュレーションを始める</Link>
            </Button>
            {/* 将来の機能用（コメントアウト） */}
            {/* <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/signup">無料で始める</Link>
            </Button> */}
          </div>
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
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <CardTitle>かんたんシミュレーション</CardTitle>
                <CardDescription>
                  年収や家族構成を入力するだけで、控除上限額の目安をすぐに計算。
                  会員登録不要ですぐに使えます。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 機能2: 一元管理 */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <CardTitle>複数ポータル一元管理</CardTitle>
                <CardDescription>
                  楽天、ふるなび、さとふるなど、複数のポータルをまたいだ寄付を
                  ひとつのダッシュボードで管理。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 機能3: 手続き管理 */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
