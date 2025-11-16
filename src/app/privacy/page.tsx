import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "プライバシーポリシー | ふるさと納税ダッシュボード",
  description: "ふるさと納税ダッシュボードのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">
        プライバシーポリシー
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. 個人情報の収集</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本サービスでは、以下の個人情報を収集する場合があります。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>メールアドレス</li>
            <li>氏名</li>
            <li>年収情報</li>
            <li>家族構成情報</li>
            <li>寄付履歴</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. 個人情報の利用目的</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            収集した個人情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>本サービスの提供・運営のため</li>
            <li>利用者からのお問い合わせに回答するため</li>
            <li>利用規約に違反した利用者や、不正・不当な目的でサービスを利用しようとする利用者の特定をし、ご利用をお断りするため</li>
            <li>上記の利用目的に付随する目的</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. 個人情報の第三者提供</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            当方は、利用者の同意を得ることなく、第三者に個人情報を提供することはありません。
            ただし、以下の場合を除きます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. 個人情報の安全管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            当方は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Cookie（クッキー）の使用について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本サービスでは、利用者の利便性向上のため、Cookieを使用することがあります。
            Cookieの使用を希望されない場合は、ブラウザの設定でCookieを無効にすることができます。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. プライバシーポリシーの変更</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
            利用者に通知することなく、変更することができるものとします。
          </p>
          <p className="text-muted-foreground">
            変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
          </p>
        </CardContent>
      </Card>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>最終更新日: 2025年11月16日</p>
      </div>
    </div>
  );
}
