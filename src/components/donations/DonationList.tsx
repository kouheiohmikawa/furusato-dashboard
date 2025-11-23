"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar, MapPin, CreditCard, FileText, Pencil, Trash2, Search, Filter, Plus } from "lucide-react";
import { deleteDonation } from "@/app/actions/donations";
import type { Donation } from "@/types/database.types";
import Link from "next/link";

type DonationListProps = {
  donations: Donation[];
};

export function DonationList({ donations }: DonationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 寄付年度のリストを取得
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    donations.forEach((donation) => {
      const year = new Date(donation.donation_date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [donations]);

  // フィルタリング処理
  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      // 検索クエリでフィルタリング
      const matchesSearch =
        searchQuery === "" ||
        donation.prefecture?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.municipality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.municipality_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.return_item?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase());

      // 年度でフィルタリング
      const donationYear = new Date(donation.donation_date).getFullYear();
      const matchesYear =
        yearFilter === "all" || donationYear.toString() === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [donations, searchQuery, yearFilter]);

  // 合計金額の計算
  const totalAmount = useMemo(() => {
    return filteredDonations.reduce((sum, donation) => sum + Number(donation.amount), 0);
  }, [filteredDonations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async (donationId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteDonation(donationId);
      if (result?.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 統計情報 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              表示中の寄付件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{filteredDonations.length}</p>
              <span className="text-sm text-muted-foreground">件</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              表示中の寄付合計額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 検索とフィルター */}
      <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ring-1 ring-slate-900/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* 検索バー */}
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="自治体名、返礼品、受領番号、メモで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 w-11 border-slate-200 dark:border-slate-800 ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' : ''}`}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* フィルター */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">年度でフィルター</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 寄付記録リスト */}
      {filteredDonations.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              寄付記録が見つかりません
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery || yearFilter !== "all"
                ? "検索条件に一致する寄付記録はありませんでした。条件を変更してお試しください。"
                : "まだ寄付記録が登録されていません。新しい寄付を登録して管理を始めましょう。"}
            </p>
            <Link href="/dashboard/donations/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" />
                寄付を登録する
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDonations.map((donation) => (
            <Card key={donation.id} className="group border-none shadow-sm hover:shadow-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  {/* 寄付情報 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {donation.prefecture && donation.municipality
                            ? `${donation.prefecture}${donation.municipality}`
                            : donation.municipality_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(donation.donation_date)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm ml-[3.25rem]">
                      {donation.donation_type && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <FileText className="h-3.5 w-3.5" />
                          {donation.donation_type}
                        </div>
                      )}
                      {donation.payment_method && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <CreditCard className="h-3.5 w-3.5" />
                          {donation.payment_method}
                        </div>
                      )}
                    </div>

                    {(donation.receipt_number || donation.return_item || donation.notes) && (
                      <div className="ml-[3.25rem] space-y-2 pt-1">
                        {donation.receipt_number && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">受領番号</span>
                            <span className="font-mono">{donation.receipt_number}</span>
                          </div>
                        )}
                        {donation.return_item && (
                          <div className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-0.5">返礼品</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{donation.return_item}</span>
                          </div>
                        )}
                        {donation.notes && (
                          <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            {donation.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 金額とアクション */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-2 pl-[3.25rem] md:pl-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">寄付金額</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {formatCurrency(Number(donation.amount))}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/donations/${donation.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-9 px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 transition-colors">
                          <Pencil className="h-4 w-4 mr-1.5" />
                          編集
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-colors" disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>寄付記録を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。「{donation.prefecture && donation.municipality
                                ? `${donation.prefecture}${donation.municipality}`
                                : donation.municipality_name}」への寄付記録が完全に削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(donation.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
