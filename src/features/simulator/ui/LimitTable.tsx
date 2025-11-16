"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table2, Info } from "lucide-react";
import {
  generateLimitTable,
  formatLimit,
  FAMILY_PATTERNS,
} from "../lib/generateLimitTable";

export function LimitTable() {
  // 早見表データを生成（メモ化してパフォーマンス向上）
  const tableData = useMemo(() => generateLimitTable(), []);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Table2 className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl">控除上限額の早見表</CardTitle>
        </div>
        <CardDescription className="text-base">
          年収と家族構成から、ふるさと納税の控除上限額の目安を確認できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 横スクロール可能なコンテナ */}
        <div className="overflow-x-auto -mx-6 px-6 rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-primary/20 bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="sticky left-0 z-10 bg-gradient-to-r from-muted/50 to-muted/30 border-r border-border/50 p-3 sm:p-4 text-left font-bold whitespace-nowrap">
                  年収
                </th>
                {FAMILY_PATTERNS.map((pattern, index) => (
                  <th
                    key={index}
                    className="p-3 sm:p-4 text-left font-bold min-w-[130px]"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="whitespace-nowrap text-foreground">{pattern.label}</span>
                      <span className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                        {pattern.description}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr
                  key={row.annualIncome}
                  className={`
                    transition-colors duration-150
                    ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                    hover:bg-primary/5
                  `}
                >
                  <td className="sticky left-0 z-10 border-r border-border/50 p-3 sm:p-4 font-semibold whitespace-nowrap bg-inherit">
                    {row.annualIncome}万円
                  </td>
                  {row.limits.map((limit, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-3 sm:p-4 text-right tabular-nums whitespace-nowrap font-medium"
                    >
                      {formatLimit(limit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 注意書き */}
        <div className="mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <p className="font-bold text-sm text-foreground">注意事項</p>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span>この早見表は、社会保険料を年収の14.4%と仮定して計算しています</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span>「高校生」は16〜18歳、「大学生」は19〜22歳を指します</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span>中学生以下の子どもは扶養控除の対象外のため、控除額に影響しません</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span>住宅ローン控除や医療費控除などがある場合、控除上限額は変動します</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span className="font-medium text-foreground">あくまで目安です。正確な金額は上記のシミュレーターで計算してください</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
