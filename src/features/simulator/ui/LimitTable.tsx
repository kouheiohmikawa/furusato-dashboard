"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateLimitTable,
  formatLimit,
  FAMILY_PATTERNS,
} from "../lib/generateLimitTable";

export function LimitTable() {
  // 早見表データを生成（メモ化してパフォーマンス向上）
  const tableData = useMemo(() => generateLimitTable(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>控除上限額の早見表</CardTitle>
        <CardDescription>
          年収と家族構成から、ふるさと納税の控除上限額の目安を確認できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 横スクロール可能なコンテナ */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="sticky left-0 z-10 bg-muted/50 border-r p-3 text-left font-semibold whitespace-nowrap">
                  年収
                </th>
                {FAMILY_PATTERNS.map((pattern, index) => (
                  <th
                    key={index}
                    className="p-3 text-left font-semibold min-w-[120px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="whitespace-nowrap">{pattern.label}</span>
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
                  className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  <td className="sticky left-0 z-10 border-r p-3 font-medium whitespace-nowrap bg-inherit">
                    {row.annualIncome}万円
                  </td>
                  {row.limits.map((limit, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-3 text-right tabular-nums whitespace-nowrap"
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
        <div className="mt-6 space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold">※ 注意事項</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              この早見表は、社会保険料を年収の14.4%と仮定して計算しています
            </li>
            <li>
              「高校生」は16〜18歳、「大学生」は19〜22歳を指します
            </li>
            <li>
              中学生以下の子どもは扶養控除の対象外のため、控除額に影響しません
            </li>
            <li>
              住宅ローン控除や医療費控除などがある場合、控除上限額は変動します
            </li>
            <li>
              あくまで目安です。正確な金額は上記のシミュレーターで計算してください
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
