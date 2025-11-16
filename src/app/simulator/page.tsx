"use client";

import { useState } from "react";
import { SimulatorForm } from "@/features/simulator/ui/SimulatorForm";
import { SimulatorResult } from "@/features/simulator/ui/SimulatorResult";
import type { SimulatorResult as SimulatorResultType } from "@/features/simulator/lib/simulatorSchema";

export default function SimulatorPage() {
  const [result, setResult] = useState<SimulatorResultType | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          ふるさと納税 控除額シミュレーター
        </h1>
        <p className="text-muted-foreground">
          年収や家族構成から、ふるさと納税の控除上限額の目安を簡単に計算できます
        </p>
      </div>

      {/* コンテンツ */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* フォーム */}
        <div>
          <SimulatorForm onResult={setResult} />
        </div>

        {/* 結果 */}
        <div>
          {result ? (
            <SimulatorResult result={result} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">
                  左のフォームに入力して、
                  <br />
                  控除額を計算してください
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* フッター情報 */}
      <div className="mt-12 p-6 rounded-lg bg-muted">
        <h2 className="text-lg font-semibold mb-3">このシミュレーターについて</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            ✓ 会員登録不要で、すぐに控除額の目安を確認できます
          </p>
          <p>
            ✓ 年収、配偶者の有無、扶養家族の人数から簡易的に計算します
          </p>
          <p>
            ✓ より正確な金額は、源泉徴収票や確定申告書類をもとに計算してください
          </p>
          <p className="pt-2 border-t">
            💡 会員登録すると、寄付の記録や詳細な管理機能をご利用いただけます
          </p>
        </div>
      </div>
    </div>
  );
}
