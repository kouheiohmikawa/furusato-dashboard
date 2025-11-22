import Link from "next/link";
import { Calculator, LayoutDashboard, Heart, FileText, Shield, HelpCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* サイト情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ふるさと納税ダッシュボード
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              複数のポータルサイトでの寄付を一元管理し、控除上限額のシミュレーションから
              確定申告のサポートまで、ふるさと納税に関するすべてをスマートに管理できる
              オールインワンツールです。
            </p>
          </div>

          {/* 機能 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">主要機能</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/simulator"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  控除額シミュレーター
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/donations"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  寄付履歴の管理
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">サポート・規約</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="flex items-center text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  ヘルプセンター
                </Link>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">ご利用にあたって</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              本サービスのシミュレーション結果は、入力された情報に基づく概算値です。
              実際の控除上限額は、その年の所得や控除の状況により変動する可能性があります。
              正確な金額については、お住まいの自治体や税務署にご確認いただくか、
              税理士等の専門家にご相談ください。
            </p>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} ふるさと納税ダッシュボード. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
