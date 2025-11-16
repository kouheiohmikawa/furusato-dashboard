import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ロゴ・サイト名 */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="hidden font-bold sm:inline-block">
            ふるさと納税ダッシュボード
          </span>
          <span className="font-bold sm:hidden">ふるさと納税</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center space-x-4">
          <Link
            href="/simulator"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            シミュレーター
          </Link>

          {/* 将来の機能用（コメントアウト） */}
          {/* <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            ログイン
          </Link>
          <Button asChild size="sm">
            <Link href="/signup">無料で始める</Link>
          </Button> */}
        </nav>
      </div>
    </header>
  );
}
