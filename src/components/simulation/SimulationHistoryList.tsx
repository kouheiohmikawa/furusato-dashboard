"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Calculator,
} from "lucide-react";
import { deleteSimulation } from "@/app/actions/simulation";
import type { SimulatorResult, SimulatorInput } from "@/features/simulator/lib/simulatorSchema";
import type { DetailedSimulatorInput } from "@/features/simulator/lib/detailedSimulatorSchema";
import type { SimulationHistory } from "@/types/database.types";

type SimulationHistoryListProps = {
  simulations: SimulationHistory[];
};

export function SimulationHistoryList({ simulations }: SimulationHistoryListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function formatCurrency(amount: number): string {
    return amount.toLocaleString("ja-JP");
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      const result = await deleteSimulation(id);

      if (result?.error) {
        alert(result.error);
      } else if (result?.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {simulations.map((simulation) => {
        const isExpanded = expandedId === simulation.id;
        const isDeleting = deletingId === simulation.id;
        // JSON型を適切な型にキャスト
        const resultData = simulation.result_data as unknown as SimulatorResult;
        const inputData = simulation.input_data as unknown as (SimulatorInput & DetailedSimulatorInput);

        return (
          <Card key={simulation.id} className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    {simulation.simulation_type === "simple" ? (
                      <Zap className="h-5 w-5 text-primary" />
                    ) : (
                      <Calculator className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">
                        {simulation.simulation_type === "simple" ? "簡易版" : "詳細版"}
                        シミュレーション
                      </CardTitle>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {simulation.simulation_type === "simple" ? "SIMPLE" : "DETAILED"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(simulation.created_at)}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 mt-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">推定上限額: </span>
                          <span className="font-semibold text-foreground">
                            ¥{formatCurrency(resultData.estimatedLimit)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">安全ライン: </span>
                          <span className="font-semibold text-foreground">
                            ¥{formatCurrency(resultData.safeLimit)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(simulation.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">閉じる</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">詳細</span>
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>履歴を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。このシミュレーション結果が完全に削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(simulation.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-4 space-y-4">
                {/* 入力データ */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    入力データ
                  </h4>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">年収: </span>
                        <span className="font-medium">{inputData.annualIncome}万円</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">配偶者: </span>
                        <span className="font-medium">
                          {inputData.hasSpouse ? "あり" : "なし"}
                        </span>
                      </div>
                      {simulation.simulation_type === "simple" && (
                        <div>
                          <span className="text-muted-foreground">扶養家族: </span>
                          <span className="font-medium">{inputData.dependentsCount}人</span>
                        </div>
                      )}
                      {inputData.prefecture && (
                        <div>
                          <span className="text-muted-foreground">都道府県: </span>
                          <span className="font-medium">{inputData.prefecture}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 計算結果の詳細 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    計算結果
                  </h4>
                  <div className="space-y-3">
                    {/* 前提条件 */}
                    {resultData.assumptions && resultData.assumptions.length > 0 && (
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-medium mb-2">前提条件</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {resultData.assumptions.map((assumption: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{assumption}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 注意事項 */}
                    {resultData.warnings && resultData.warnings.length > 0 && (
                      <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <p className="text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
                          注意事項
                        </p>
                        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                          {resultData.warnings.map((warning: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
