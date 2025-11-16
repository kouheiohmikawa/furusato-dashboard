import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "利用規約 | ふるさと納税ダッシュボード",
  description: "ふるさと納税ダッシュボードの利用規約",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">利用規約</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>第1条（適用）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本利用規約（以下「本規約」といいます）は、ふるさと納税ダッシュボード（以下「本サービス」といいます）の利用条件を定めるものです。
          </p>
          <p className="text-muted-foreground">
            利用者の皆様には、本規約に従って本サービスをご利用いただきます。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>第2条（利用登録）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本サービスの利用を希望する方は、本規約に同意の上、当方の定める方法によって利用登録を申請し、
            当方がこれを承認することによって、利用登録が完了するものとします。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>第3条（禁止事項）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>当方、ほかの利用者、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスによって得られた情報を商業的に利用する行為</li>
            <li>当方のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>第4条（本サービスの提供の停止等）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            当方は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当方が本サービスの提供が困難と判断した場合</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>第5条（免責事項）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本サービスに掲載されている情報は、あくまで目安です。
            実際の控除額は、所得控除の状況により変動する場合があります。
          </p>
          <p className="text-muted-foreground">
            当方は、本サービスの内容の正確性、完全性、有用性について、いかなる保証もいたしません。
          </p>
          <p className="text-muted-foreground">
            利用者が本サービスを利用して被った損害について、当方は一切の責任を負いません。
          </p>
        </CardContent>
      </Card>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>最終更新日: 2025年11月16日</p>
      </div>
    </div>
  );
}
