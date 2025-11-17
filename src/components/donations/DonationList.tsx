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
import { Calendar, MapPin, CreditCard, FileText, Pencil, Trash2, Search, Filter } from "lucide-react";
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
        donation.municipality_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="space-y-6">
      {/* 検索とフィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* 検索バー */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="自治体名、受領番号、メモで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* フィルター */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label>年度でフィルター</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
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
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              表示中の寄付件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredDonations.length}件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              表示中の寄付合計額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 寄付記録リスト */}
      {filteredDonations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || yearFilter !== "all"
                ? "条件に一致する寄付記録が見つかりませんでした"
                : "まだ寄付記録がありません"}
            </p>
            <Link href="/dashboard/donations/add">
              <Button className="mt-4">寄付を登録</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => (
            <Card key={donation.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* 寄付情報 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {donation.municipality_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(donation.donation_date)}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      {donation.donation_type && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {donation.donation_type}
                        </div>
                      )}
                      {donation.payment_method && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          {donation.payment_method}
                        </div>
                      )}
                    </div>

                    {donation.receipt_number && (
                      <p className="text-sm text-muted-foreground">
                        受領番号: {donation.receipt_number}
                      </p>
                    )}

                    {donation.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {donation.notes}
                      </p>
                    )}
                  </div>

                  {/* 金額とアクション */}
                  <div className="flex flex-col items-end gap-3 md:w-48">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(donation.amount))}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/donations/${donation.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>寄付記録を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。「{donation.municipality_name}」への寄付記録が完全に削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(donation.id)}
                              className="bg-destructive hover:bg-destructive/90"
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
