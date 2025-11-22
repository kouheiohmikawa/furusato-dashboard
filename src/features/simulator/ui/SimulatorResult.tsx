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
    <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-primary/5 animate-in fade-in-50 duration-500">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl">シミュレーション結果</CardTitle>
        </div>
        <CardDescription className="text-base">
          ふるさと納税の控除上限額の目安が計算されました
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 推定上限額 - メインの結果 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium">推定上限額</p>
            </div>
            <p className="text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
              ¥{formatCurrency(result.estimatedLimit)}
            </p>
            <p className="text-sm text-primary-foreground/90 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>この金額までの寄付で、自己負担2,000円で済みます</span>
            </p>
          </div>
        </div>

        {/* 安全ライン - 推奨値 */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 p-5 border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  安全ライン（推奨）
                </p>
              </div>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                ¥{formatCurrency(result.safeLimit)}
              </p>
            </div>

            {/* プログレスバー */}
            <div className="space-y-2">
              <div className="h-2 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${safeLimitRatio}%` }}
                />
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  余裕を持った金額です。上限を超えるリスクを避けたい方におすすめです
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 前提条件 */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3 border border-border/50">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">計算の前提条件</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {result.assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 注意事項 */}
        <div className="rounded-xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              注意事項
            </h4>
          </div>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            {result.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* アクション - 保存ボタン */}
        <div className="pt-4 border-t border-border/50 space-y-4">
          {/* 成功メッセージ */}
          {saveStatus === "success" && (
            <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 flex items-start gap-2 animate-in fade-in-50 duration-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {saveMessage}
              </p>
            </div>
          )}

          {/* エラーメッセージ */}
          {saveStatus === "error" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{saveMessage}</p>
            </div>
          )}

          {/* 認証必要メッセージ */}
          {saveStatus === "auth_required" && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  {saveMessage}
                </p>
              </div>
              <Link href="/login">
                <Button size="sm" variant="outline" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインページへ
                </Button>
              </Link>
            </div>
          )}

          {/* 保存ボタン */}
          <Button
            onClick={handleSave}
            disabled={isSaving || saveStatus === "success"}
            className="w-full"
            size="lg"
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
                この結果を保存
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            保存した結果は、ダッシュボードのシミュレーション履歴から確認できます
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
