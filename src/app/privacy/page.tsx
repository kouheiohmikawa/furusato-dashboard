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
          <CardTitle>5. Cookie（クッキー）と広告配信について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本サービスでは、利用者の利便性向上のため、Cookieを使用することがあります。
          </p>

          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mt-4">Google AdSenseについて</h3>
          <p className="text-muted-foreground">
            当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
            Cookieを無効にする設定やGoogleアドセンスに関する詳細は<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">「Googleポリシーと規約」</a>をご覧ください。
          </p>

          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mt-4">アクセス解析ツールについて</h3>
          <p className="text-muted-foreground">
            当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
            このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
            このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>7. お問い合わせ窓口</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
          </p>
          <p className="text-muted-foreground">
            お問い合わせ先: <a href="mailto:furusato.dashboard.service@gmail.com" className="text-blue-600 hover:underline">furusato.dashboard.service@gmail.com</a>
          </p>
        </CardContent>
      </Card>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>最終更新日: 2025年11月16日</p>
      </div>
    </div>
  );
}
