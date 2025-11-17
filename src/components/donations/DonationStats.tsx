"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, PieChart } from "lucide-react";
import type { Donation } from "@/types/database.types";

type DonationStatsProps = {
  donations: Donation[];
};

type YearStats = {
  year: number;
  count: number;
  total: number;
};

export function DonationStats({ donations }: DonationStatsProps) {
  // 年度別の統計を計算
  const yearlyStats = useMemo(() => {
    const statsMap = new Map<number, YearStats>();

    donations.forEach((donation) => {
      const year = new Date(donation.donation_date).getFullYear();
      const existing = statsMap.get(year) || { year, count: 0, total: 0 };

      statsMap.set(year, {
        year,
        count: existing.count + 1,
        total: existing.total + Number(donation.amount),
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.year - a.year);
  }, [donations]);

  // 全期間の統計
  const totalStats = useMemo(() => {
    return {
      count: donations.length,
      total: donations.reduce((sum, d) => sum + Number(d.amount), 0),
    };
  }, [donations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 全期間統計 */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            全期間の統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">総寄付件数</p>
              <p className="text-3xl font-bold text-primary">{totalStats.count}件</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">総寄付額</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(totalStats.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 年度別統計 */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            年度別統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          {yearlyStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              まだ寄付記録がありません
            </p>
          ) : (
            <div className="space-y-4">
              {yearlyStats.map((stats) => (
                <div
                  key={stats.year}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{stats.year}年</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{stats.count}件</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(stats.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      平均 {formatCurrency(Math.round(stats.total / stats.count))}/件
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
