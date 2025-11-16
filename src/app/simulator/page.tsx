"use client";

import { useState } from "react";
import { SimulatorForm } from "@/features/simulator/ui/SimulatorForm";
import { DetailedSimulatorForm } from "@/features/simulator/ui/DetailedSimulatorForm";
import { SimulatorResult } from "@/features/simulator/ui/SimulatorResult";
import { LimitTable } from "@/features/simulator/ui/LimitTable";
import type { SimulatorResult as SimulatorResultType } from "@/features/simulator/lib/simulatorSchema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Zap, Info, Shield, Sparkles } from "lucide-react";

export default function SimulatorPage() {
  const [result, setResult] = useState<SimulatorResultType | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
            <Calculator className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            ふるさと納税 控除額シミュレーター
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            年収や家族構成から、ふるさと納税の控除上限額の目安を簡単に計算できます
          </p>
        </div>

        {/* タブ */}
        <Tabs defaultValue="simple" className="w-full" onValueChange={() => setResult(null)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-auto p-1 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="simple" className="gap-2 py-3">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">簡易版</span>
              <span className="sm:hidden">簡易</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="gap-2 py-3">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">詳細版</span>
              <span className="sm:hidden">詳細</span>
            </TabsTrigger>
          </TabsList>

          {/* 簡易版 */}
          <TabsContent value="simple" className="mt-8">
            <div className="grid gap-6 xl:grid-cols-2">
              {/* フォーム */}
              <div>
                <SimulatorForm onResult={setResult} />
              </div>

              {/* 結果 */}
              <div className="xl:sticky xl:top-8 xl:self-start">
                {result ? (
                  <SimulatorResult result={result} />
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground space-y-4 p-8">
                      <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 mb-2">
                        <Calculator className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                      <p className="text-base font-medium">
                        フォームに入力して
                        <br className="sm:hidden" />
                        <span className="hidden sm:inline"> </span>
                        計算を開始
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        控除上限額の目安を確認できます
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 詳細版 */}
          <TabsContent value="detailed" className="mt-8">
            <div className="grid gap-6 xl:grid-cols-2">
              {/* フォーム */}
              <div>
                <DetailedSimulatorForm onResult={setResult} />
              </div>

              {/* 結果 */}
              <div className="xl:sticky xl:top-8 xl:self-start">
                {result ? (
                  <SimulatorResult result={result} />
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground space-y-4 p-8">
                      <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 mb-2">
                        <Calculator className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                      <p className="text-base font-medium">
                        フォームに入力して
                        <br className="sm:hidden" />
                        <span className="hidden sm:inline"> </span>
                        計算を開始
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        控除上限額の目安を確認できます
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
      </Tabs>

        {/* 早見表セクション */}
        <div className="mt-16 sm:mt-20">
          <LimitTable />
        </div>

        {/* フッター情報 */}
        <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            このシミュレーターについて
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">簡易版</strong>: 年収、配偶者の有無、扶養家族の人数から簡単に計算
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Calculator className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">詳細版</strong>: 各種控除額を入力してより正確に計算
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <p>
                会員登録不要で、すぐに控除額の目安を確認できます
              </p>
            </div>
            <div className="pt-3 border-t border-border/50 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-foreground/80">
                会員登録すると、寄付の記録や詳細な管理機能をご利用いただけます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
