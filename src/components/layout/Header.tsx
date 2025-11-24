import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type HeaderProps = {
  isLoggedIn?: boolean;
};

export function Header({ isLoggedIn = false }: HeaderProps) {
  const homeLink = isLoggedIn ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ロゴ・サイト名 */}
        <Link href={homeLink} className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.svg"
              alt="ふるさと納税ダッシュボード"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </div>
          <span className="hidden font-bold text-lg sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            ふるさと納税ダッシュボード
          </span>
          <span className="font-bold text-lg sm:hidden bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            ふるさと納税
          </span>
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Button asChild variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Link href="/simulator">
              シミュレーター
            </Link>
          </Button>
          {!isLoggedIn && (
            <>
              <Button asChild variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Link href="/login">
                  ログイン
                </Link>
              </Button>
              <Button asChild size="sm" className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-0">
                <Link href="/signup">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  無料で始める
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
