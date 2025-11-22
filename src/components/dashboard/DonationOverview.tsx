"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, CheckCircle2, Calendar, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import type { Donation } from "@/types/database.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type DonationOverviewProps = {
  donations: Donation[];
  estimatedLimit?: number;
};

type PortalStats = {
  portal: string;
  count: number;
  total: number;
};

export function DonationOverview({ donations, estimatedLimit }: DonationOverviewProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [showDetails, setShowDetails] = useState(false);

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
      const portal = donation.payment_method || "未設定";
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

    return [
      { name: "寄付済み", value: used, color: "hsl(var(--primary))" },
      { name: "残り", value: remainingAmount, color: "hsl(var(--muted))" },
    ];
  }, [yearStats.total, estimatedLimit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  if (donations.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-muted">
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">まだ寄付記録がありません</h3>
              <p className="text-sm text-muted-foreground">
                寄付記録を登録して、ふるさと納税を一元管理しましょう
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 年度選択 */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
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

      {/* メインカード - 円グラフでコンパクトに */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedYear}年の寄付状況
              </CardTitle>
              <CardDescription className="mt-1">
                {estimatedLimit
                  ? `${yearStats.count}件の寄付を登録済み`
                  : "控除上限額を計算しましょう"}
              </CardDescription>
            </div>
            {estimatedLimit && (
              <>
                {percentage >= 100 ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    上限超過
                  </Badge>
                ) : percentage >= 80 ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600 gap-1">
                    <AlertCircle className="h-3 w-3" />
                    上限接近
                  </Badge>
                ) : (
                  <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    余裕あり
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {estimatedLimit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 円グラフ */}
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </RechartsChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-2xl font-bold text-primary">
                    {percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">使用率</p>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">現在の寄付総額</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(yearStats.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">推定上限額</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(estimatedLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">残り枠</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 上限額未設定の場合 */}
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
                    <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">控除上限額を計算しましょう</h3>
                  <p className="text-sm text-muted-foreground">
                    シミュレーターで年収や家族構成を入力
                  </p>
                </div>
                {yearStats.total > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">現在の寄付総額</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(yearStats.total)}
                    </p>
                  </div>
                )}
                <div className="flex justify-center">
                  <Link href="/simulator">
                    <Button className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      控除額を計算する
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 詳細統計（折りたたみ可能） */}
      {portalStats.length > 0 && (
        <Card className="border">
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                支払い方法別の内訳
              </CardTitle>
              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {showDetails && (
            <CardContent>
              <div className="space-y-2">
                {portalStats.map((stat, index) => (
                  <div
                    key={stat.portal}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stat.portal}</p>
                        <p className="text-xs text-muted-foreground">
                          {stat.count}件
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(stat.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((stat.total / yearStats.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
