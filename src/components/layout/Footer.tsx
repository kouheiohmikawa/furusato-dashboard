import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* サイト情報 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">ふるさと納税ダッシュボード</h3>
            <p className="text-sm text-muted-foreground">
              ふるさと納税の控除額シミュレーションと寄付管理を簡単に。
            </p>
          </div>

          {/* 機能 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">機能</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/simulator"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  控除額シミュレーター
                </Link>
              </li>
              {/* 将来の機能用（コメントアウト） */}
              {/* <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/donations"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  寄付管理
                </Link>
              </li> */}
            </ul>
          </div>

          {/* サポート */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>

          {/* その他 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">このサイトについて</h3>
            <p className="text-xs text-muted-foreground">
              本サービスは、ふるさと納税の控除額を簡易的に計算するツールです。
              実際の控除額は、所得控除の状況により変動する場合があります。
            </p>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} ふるさと納税ダッシュボード. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
