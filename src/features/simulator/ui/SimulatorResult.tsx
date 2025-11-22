"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Info, AlertTriangle, Sparkles, Save, CheckCircle2, LogIn } from "lucide-react";
import { saveSimulation } from "@/app/actions/simulation";
import type { SimulatorResult, SimulatorInput } from "../lib/simulatorSchema";
import type { DetailedSimulatorInput } from "../lib/detailedSimulatorSchema";
import Link from "next/link";

type SimulatorResultProps = {
  result: SimulatorResult;
  inputData: SimulatorInput | DetailedSimulatorInput;
  simulationType: "simple" | "detailed";
};

/**
 * 金額を3桁区切りでフォーマット
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

export function SimulatorResult({ result, inputData, simulationType }: SimulatorResultProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error" | "auth_required">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const safeLimitRatio = (result.safeLimit / result.estimatedLimit) * 100;

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      const response = await saveSimulation(simulationType, inputData, result);

      if (response.error) {
        if (response.error === "認証が必要です") {
          setSaveStatus("auth_required");
          setSaveMessage("結果を保存するにはログインが必要です");
        } else {
          setSaveStatus("error");
          setSaveMessage(response.error);
        }
      } else if (response.success) {
        setSaveStatus("success");
        setSaveMessage(response.message || "保存しました");
        // 3秒後にメッセージをクリア
        setTimeout(() => {
          setSaveStatus("idle");
          setSaveMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
      setSaveMessage("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 animate-in fade-in-50 duration-500">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">シミュレーション結果</CardTitle>
            <CardDescription className="text-base mt-1">
              あなたの控除上限額の目安が計算されました
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 推定上限額 - メインの結果 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 p-8 shadow-2xl ring-1 ring-white/10">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-200/80">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium tracking-wide uppercase">推定上限額</p>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline justify-center sm:justify-start gap-1">
              <span className="text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
                ¥{formatCurrency(result.estimatedLimit)}
              </span>
              <span className="text-lg text-slate-400 font-medium">まで</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
              <Info className="h-3.5 w-3.5 text-blue-200" />
              <span className="text-xs text-blue-100 font-medium">自己負担2,000円で寄付できる上限額</span>
            </div>
          </div>
        </div>

        {/* 安全ライン - 推奨値 */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  安全ライン（推奨）
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  計算誤差を考慮した安全な金額
                </p>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              ¥{formatCurrency(result.safeLimit)}
            </p>
          </div>

          {/* プログレスバー */}
          <div className="space-y-2">
            <div className="h-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                style={{ width: `${safeLimitRatio}%` }}
              />
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-right font-medium">
              推定額の約{safeLimitRatio.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* 前提条件 */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/50 p-5 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">計算の前提条件</h4>
            </div>
            <ul className="space-y-2.5">
              {result.assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400 leading-snug">
                  <span className="block w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 注意事項 */}
          <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/20 p-5 border border-amber-200/60 dark:border-amber-900/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                注意事項
              </h4>
            </div>
            <ul className="space-y-2.5">
              {result.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-amber-700 dark:text-amber-300 leading-snug">
                  <span className="block w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* アクション - 保存ボタン */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* 成功メッセージ */}
          {saveStatus === "success" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900 p-4 flex items-start gap-3 animate-in fade-in-50 duration-300">
              <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  保存しました
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {saveMessage}
                </p>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {saveStatus === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-4 flex items-start gap-3">
              <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mt-0.5">{saveMessage}</p>
            </div>
          )}

          {/* 認証必要メッセージ */}
          {saveStatus === "auth_required" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    ログインが必要です
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    {saveMessage}
                  </p>
                </div>
              </div>
              <Link href="/login" className="block">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインページへ移動
                </Button>
              </Link>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || saveStatus === "success"}
              className={`w-full h-12 text-base font-semibold transition-all duration-300 ${saveStatus === "success"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                }`}
            >
              {isSaving ? (
                <>
                  <span className="mr-2">保存中...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  保存済み
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  シミュレーション結果を保存
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              保存すると、ダッシュボードで履歴を確認したり、<br className="sm:hidden" />
              寄付管理に反映させることができます
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
