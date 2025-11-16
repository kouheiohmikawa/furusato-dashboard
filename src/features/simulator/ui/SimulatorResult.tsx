"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulatorResult } from "../lib/simulatorSchema";

type SimulatorResultProps = {
  result: SimulatorResult;
};

/**
 * 金額を3桁区切りでフォーマット
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

export function SimulatorResult({ result }: SimulatorResultProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>シミュレーション結果</CardTitle>
        <CardDescription>
          ふるさと納税の控除上限額の目安が計算されました
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 推定上限額 */}
        <div className="rounded-lg bg-primary/10 p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">推定上限額</p>
          <p className="text-4xl font-bold text-primary">
            ¥{formatCurrency(result.estimatedLimit)}
          </p>
          <p className="text-sm text-muted-foreground">
            この金額までの寄付で、自己負担2,000円で済みます
          </p>
        </div>

        {/* 安全ライン */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">安全ライン（推奨）</p>
            <p className="text-2xl font-bold">¥{formatCurrency(result.safeLimit)}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            余裕を持った金額です。上限を超えるリスクを避けたい方におすすめです
          </p>
        </div>

        {/* 前提条件 */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">計算の前提条件</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {result.assumptions.map((assumption, index) => (
              <li key={index}>{assumption}</li>
            ))}
          </ul>
        </div>

        {/* 注意事項 */}
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            ⚠️ 注意事項
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            {result.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>

        {/* アクション */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            より詳細な計算や寄付の記録は、会員登録後にご利用いただけます
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
