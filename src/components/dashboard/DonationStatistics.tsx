"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MapPin, Globe, Calendar, PieChartIcon } from "lucide-react";
import type { Donation } from "@/types/database.types";

type DonationStatisticsProps = {
  donations: Donation[];
};

// グラフの色定義
const CHART_COLORS = {
  primary: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4", "#eab308", "#f43f5e"],
  gradient: {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  }
};

export function DonationStatistics({ donations }: DonationStatisticsProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // 年度リストを取得
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    donations.forEach((donation) => {
      const year = new Date(donation.donation_date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [donations]);

  // 選択された年度でフィルタリング
  const filteredDonations = useMemo(() => {
    if (selectedYear === "all") return donations;
    return donations.filter((donation) => {
      const year = new Date(donation.donation_date).getFullYear();
      return year.toString() === selectedYear;
    });
  }, [donations, selectedYear]);

  // 統計データ計算
  const stats = useMemo(() => {
    const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalCount = filteredDonations.length;
    const averageAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    return { totalAmount, totalCount, averageAmount };
  }, [filteredDonations]);

  // ポータルサイト別データ
  const portalData = useMemo(() => {
    const portalMap = new Map<string, { amount: number; count: number }>();

    filteredDonations.forEach((donation) => {
      const portal = donation.portal_site || "未設定";
      const existing = portalMap.get(portal) || { amount: 0, count: 0 };
      portalMap.set(portal, {
        amount: existing.amount + donation.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(portalMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: stats.totalAmount > 0 ? Math.round((data.amount / stats.totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredDonations, stats.totalAmount]);

  // 都道府県別データ（上位10件）
  const prefectureData = useMemo(() => {
    const prefMap = new Map<string, { amount: number; count: number }>();

    filteredDonations.forEach((donation) => {
      const pref = donation.prefecture || donation.municipality_name?.substring(0, 3) || "不明";
      const existing = prefMap.get(pref) || { amount: 0, count: 0 };
      prefMap.set(pref, {
        amount: existing.amount + donation.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(prefMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredDonations]);

  // 月別データ
  const monthlyData = useMemo(() => {
    if (selectedYear === "all") return [];

    const monthMap = new Map<number, number>();
    for (let i = 1; i <= 12; i++) {
      monthMap.set(i, 0);
    }

    filteredDonations.forEach((donation) => {
      const date = new Date(donation.donation_date);
      const month = date.getMonth() + 1;
      monthMap.set(month, (monthMap.get(month) || 0) + donation.amount);
    });

    return Array.from(monthMap.entries()).map(([month, amount]) => ({
      month: `${month}月`,
      amount,
    }));
  }, [filteredDonations, selectedYear]);

  // 寄付の種類別データ
  const donationTypeData = useMemo(() => {
    const typeMap = new Map<string, { amount: number; count: number }>();

    filteredDonations.forEach((donation) => {
      const type = donation.donation_type || "未設定";
      const existing = typeMap.get(type) || { amount: 0, count: 0 };
      typeMap.set(type, {
        amount: existing.amount + donation.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(typeMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: stats.totalAmount > 0 ? Math.round((data.amount / stats.totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredDonations, stats.totalAmount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (donations.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            寄付記録がありません。寄付を登録すると統計が表示されます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* 年度選択と統計サマリー */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* 年度選択 */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="pt-6">
            <Label className="text-sm font-medium mb-2 block">表示年度</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての年度</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 統計カード */}
        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">寄付件数</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">件</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">合計金額</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">平均金額</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.averageAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ポータルサイト別グラフ */}
      {portalData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                ポータルサイト別寄付額
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portalData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={100} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="amount" name="金額" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-500" />
                ポータルサイト別割合
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portalData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name} (${Math.round((entry.value / stats.totalAmount) * 100)}%)`}
                    labelLine={false}
                  >
                    {portalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 都道府県別グラフ */}
      {prefectureData.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              都道府県別寄付額（上位10件）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={prefectureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="amount" name="金額" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 月別推移グラフ */}
      {monthlyData.length > 0 && selectedYear !== "all" && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              {selectedYear}年 月別寄付額推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="金額"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 寄付の種類別グラフ */}
      {donationTypeData.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              寄付の種類別割合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donationTypeData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${Math.round((entry.value / stats.totalAmount) * 100)}%)`}
                >
                  {donationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
