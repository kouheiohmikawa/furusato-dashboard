"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, CheckCircle2, Calendar, PieChart, ChevronDown, ChevronUp, Settings, ArrowRight, Heart, Calculator } from "lucide-react";
import type { Donation } from "@/types/database.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";

type DonationOverviewProps = {
  donations: Donation[];
  estimatedLimit?: number;
  limitSource?: "manual" | "simulation" | "none";
};

type PortalStats = {
  portal: string;
  count: number;
  total: number;
};

export function DonationOverview({ donations, estimatedLimit, limitSource = "none" }: DonationOverviewProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // 利用可能な年度を取得
  const availableYears = useMemo(() => {
    const years = new Set(
      donations.map((d) => new Date(d.donation_date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [donations]);

  // 選択された年度の寄付を取得
  const yearDonations = useMemo(() => {
    return donations.filter(
      (d) => new Date(d.donation_date).getFullYear() === parseInt(selectedYear)
    );
  }, [donations, selectedYear]);

  // 年度別の統計
  const yearStats = useMemo(() => {
    const total = yearDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    const count = yearDonations.length;
    return { total, count };
  }, [yearDonations]);

  // ポータル別の統計
  const portalStats = useMemo(() => {
    const statsMap = new Map<string, PortalStats>();

    yearDonations.forEach((donation) => {
      const portal = donation.portal_site || "未設定";
      const existing = statsMap.get(portal) || { portal, count: 0, total: 0 };

      statsMap.set(portal, {
        portal,
        count: existing.count + 1,
        total: existing.total + Number(donation.amount),
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  }, [yearDonations]);

  // 上限額から進捗を計算
  const percentage = estimatedLimit && estimatedLimit > 0 ? (yearStats.total / estimatedLimit) * 100 : 0;
  const remaining = estimatedLimit ? Math.max(0, estimatedLimit - yearStats.total) : 0;

  // 円グラフ用のデータ
  const chartData = useMemo(() => {
    if (!estimatedLimit || estimatedLimit === 0) return [];

    const used = yearStats.total;
    const remainingAmount = Math.max(0, estimatedLimit - used);
    const isOverLimit = used > estimatedLimit;

    // 上限超過時は赤色、通常時はプライマリカラー
    const usedColor = isOverLimit
      ? "#ef4444" // 赤色（上限超過）
      : percentage >= 80
        ? "#f59e0b" // 黄色（上限接近）
        : "#3b82f6"; // 青色（通常）

    if (isOverLimit) {
      // 上限超過時は全体を赤で表示
      return [
        { name: "寄付済み（超過）", value: used, color: usedColor },
      ];
    }

    return [
      { name: "寄付済み", value: used, color: usedColor },
      { name: "残り枠", value: remainingAmount, color: "#e2e8f0" }, // 明るいグレー
    ];
  }, [yearStats.total, estimatedLimit, percentage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  if (donations.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm">
                <PieChart className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">まだ寄付記録がありません</h3>
              <p className="text-sm text-muted-foreground">
                寄付記録を登録して、ふるさと納税を一元管理しましょう
              </p>
            </div>
            <Link href="/dashboard/donations/add">
              <Button className="mt-4">
                最初の寄付を登録
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* 年度選択とサマリーヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {selectedYear}年の状況
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {estimatedLimit
              ? `上限額まであと ${formatCurrency(remaining)}`
              : "まずは控除上限額を計算しましょう"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* メインカード */}
      <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
        <CardContent className="p-6 sm:p-8">
          {estimatedLimit ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* 左側: 円グラフ (5 columns) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                {/* ステータスバッジ */}
                <div className="absolute top-0 left-0 z-10">
                  {percentage >= 100 ? (
                    <Badge variant="destructive" className="gap-1.5 py-1.5 px-3 text-sm shadow-sm">
                      <AlertCircle className="h-4 w-4" />
                      上限超過
                    </Badge>
                  ) : percentage >= 80 ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 gap-1.5 py-1.5 px-3 text-sm shadow-sm">
                      <AlertCircle className="h-4 w-4" />
                      上限接近
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1.5 py-1.5 px-3 text-sm shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      余裕あり
                    </Badge>
                  )}
                </div>

                <div className="w-full aspect-square max-w-[320px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={chartData.length > 1 ? 4 : 0}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 8}
                                    className="fill-slate-900 dark:fill-slate-100 text-5xl font-bold tracking-tighter"
                                  >
                                    {percentage.toFixed(0)}
                                    <tspan className="text-2xl font-normal text-muted-foreground">%</tspan>
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-sm font-medium"
                                  >
                                    使用率
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: 500
                        }}
                      />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 右側: 統計情報 (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 3つの主要指標 - リスト形式に変更して横幅を確保 */}
                <div className="flex flex-col gap-3">
                  {/* 寄付総額 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 shrink-0">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">寄付総額</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {yearStats.count}件の寄付
                        </p>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-right ml-4">
                      {formatCurrency(yearStats.total)}
                    </p>
                  </div>

                  {/* 推定上限額 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600/80 dark:text-slate-400/80 uppercase tracking-wider">推定上限額</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {limitSource === "manual" ? (
                            <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <Settings className="h-3 w-3 mr-1" />
                              手動設定
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              シミュレーション
                            </Badge>
                          )}
                          <Link href="/dashboard/profile" className="text-[10px] text-blue-600 hover:underline whitespace-nowrap">
                            変更
                          </Link>
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-right ml-4">
                      {formatCurrency(estimatedLimit)}
                    </p>
                  </div>

                  {/* 残り枠/超過額 */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${percentage >= 100
                      ? "bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900"
                      : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900"
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg shrink-0 ${percentage >= 100
                          ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                          : "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                        }`}>
                        {percentage >= 100 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${percentage >= 100
                            ? "text-red-600/80 dark:text-red-400/80"
                            : "text-emerald-600/80 dark:text-emerald-400/80"
                          }`}>
                          {percentage >= 100 ? "超過額" : "残り枠"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {percentage >= 100 ? "上限を超えています" : "まだ寄付できます"}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold tracking-tight text-right ml-4 ${percentage >= 100
                        ? "text-red-700 dark:text-red-400"
                        : "text-emerald-700 dark:text-emerald-400"
                      }`}>
                      {percentage >= 100 ? "+" : ""}{formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>

                {/* ポータルサイト内訳（トップ3） */}
                {portalStats.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground">利用したポータルサイト</h3>
                      <Link href="/dashboard/donations" className="text-xs text-blue-600 hover:underline flex items-center">
                        すべて見る <ChevronDown className="h-3 w-3 ml-0.5 -rotate-90" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {portalStats.slice(0, 3).map((stat, index) => (
                        <div key={stat.portal} className="relative">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{stat.portal}</span>
                              <span className="text-xs text-muted-foreground">({stat.count}件)</span>
                            </div>
                            <span className="font-medium">{formatCurrency(stat.total)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(stat.total / yearStats.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-900/5">
                  <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  まずは控除上限額を知りましょう
                </h3>
                <p className="text-muted-foreground">
                  年収や家族構成を入力するだけで、あなたのふるさと納税の上限額（目安）がすぐに分かります。
                </p>
              </div>
              <Link href="/simulator">
                <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                  シミュレーションを始める
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


