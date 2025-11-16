"use client";

import { useState } from "react";
import { SimulatorForm } from "@/features/simulator/ui/SimulatorForm";
import { DetailedSimulatorForm } from "@/features/simulator/ui/DetailedSimulatorForm";
import { SimulatorResult } from "@/features/simulator/ui/SimulatorResult";
import type { SimulatorResult as SimulatorResultType } from "@/features/simulator/lib/simulatorSchema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SimulatorPage() {
  const [result, setResult] = useState<SimulatorResultType | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          ふるさと納税 控除額シミュレーター
        </h1>
        <p className="text-muted-foreground">
          年収や家族構成から、ふるさと納税の控除上限額の目安を簡単に計算できます
        </p>
      </div>

      {/* タブ */}
      <Tabs defaultValue="simple" className="w-full" onValueChange={() => setResult(null)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="simple">簡易版</TabsTrigger>
          <TabsTrigger value="detailed">詳細版</TabsTrigger>
        </TabsList>

        {/* 簡易版 */}
        <TabsContent value="simple">
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
        </TabsContent>

        {/* 詳細版 */}
        <TabsContent value="detailed">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* フォーム */}
            <div>
              <DetailedSimulatorForm onResult={setResult} />
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
        </TabsContent>
      </Tabs>

      {/* フッター情報 */}
      <div className="mt-12 p-6 rounded-lg bg-muted">
        <h2 className="text-lg font-semibold mb-3">このシミュレーターについて</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            ✓ <strong>簡易版</strong>: 年収、配偶者の有無、扶養家族の人数から簡単に計算
          </p>
          <p>
            ✓ <strong>詳細版</strong>: 各種控除額を入力してより正確に計算
          </p>
          <p>
            ✓ 会員登録不要で、すぐに控除額の目安を確認できます
          </p>
          <p className="pt-2 border-t">
            💡 会員登録すると、寄付の記録や詳細な管理機能をご利用いただけます
          </p>
        </div>
      </div>
    </div>
  );
}
