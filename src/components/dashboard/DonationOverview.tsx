"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, CheckCircle2, Calendar, PieChart } from "lucide-react";
import type { Donation } from "@/types/database.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

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
    <div className="space-y-6">
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

      {/* メインカード - 上限額との比較 */}
      <Card className="border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {selectedYear}年の寄付状況
              </CardTitle>
              <CardDescription className="mt-2">
                {estimatedLimit
                  ? "控除上限額と現在の寄付額を比較"
                  : "控除上限額を計算して、寄付の目安を確認しましょう"}
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
        <CardContent className="space-y-6">
          {estimatedLimit ? (
            <>
              {/* 進捗バー */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">現在の寄付総額</p>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(yearStats.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">推定上限額</p>
                    <p className="text-2xl font-semibold">
                      {formatCurrency(estimatedLimit)}
                    </p>
                  </div>
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {percentage.toFixed(1)}% 使用
                  </span>
                  <span className="font-medium text-primary">
                    残り {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 上限額未設定の場合 */}
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
                    <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg">控除上限額がまだ計算されていません</h3>
                  <p className="text-sm text-muted-foreground">
                    シミュレーターで年収や家族構成を入力して、<br />
                    あなたの控除上限額を計算しましょう
                  </p>
                </div>
                {yearStats.total > 0 && (
                  <div className="flex items-center justify-center pt-2">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">現在の寄付総額</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(yearStats.total)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <Link href="/simulator">
                    <Button size="lg" className="gap-2">
                      <TrendingUp className="h-5 w-5" />
                      控除額を計算する
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* 統計 - 上限額が設定されている場合のみ */}
          {estimatedLimit && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">寄付件数</p>
                <p className="text-2xl font-bold">{yearStats.count}件</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">平均寄付額</p>
                <p className="text-2xl font-bold">
                  {yearStats.count > 0
                    ? formatCurrency(Math.round(yearStats.total / yearStats.count))
                    : "¥0"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ポータル別内訳 */}
      {portalStats.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              支払い方法別の内訳
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portalStats.map((stat, index) => (
                <div
                  key={stat.portal}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{stat.portal}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.count}件
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
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
        </Card>
      )}
    </div>
  );
}
