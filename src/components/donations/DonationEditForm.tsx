"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Save,
  MapPin,
  Calendar,
  Building2,
  Gift,
  Tag,
  Link as LinkIcon,
  FileText,
  CreditCard,
  Globe,
  Receipt,
  StickyNote,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { updateDonation } from "@/app/actions/donations";
import {
  DONATION_TYPES,
  PAYMENT_METHODS,
  PORTAL_SITES,
} from "@/lib/constants/donations";
import { PREFECTURES } from "@/shared/config/prefectures";
import type { Donation } from "@/types/database.types";

type DonationEditFormProps = {
  donation: Donation;
  categories: { id: number; name: string; }[];
  subcategories: { id: number; category_id: number; name: string; }[];
};

export function DonationEditForm({ donation, categories, subcategories }: DonationEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prefecture, setPrefecture] = useState(donation.prefecture || "");
  const [donationType, setDonationType] = useState(donation.donation_type || "");
  const [paymentMethod, setPaymentMethod] = useState(donation.payment_method || "");
  const [portalSite, setPortalSite] = useState(donation.portal_site || "");

  // カテゴリ初期値の特定
  const initialSubcategory = donation.subcategory_id
    ? subcategories.find(s => s.id === donation.subcategory_id)
    : null;
  const initialMainCategoryId = initialSubcategory
    ? initialSubcategory.category_id.toString()
    : "";

  // カテゴリ選択用ステート
  const [selectedMainCategory, setSelectedMainCategory] = useState(initialMainCategoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(donation.subcategory_id?.toString() || "");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 選択された大カテゴリに基づく小カテゴリリスト
  const availableSubcategories = selectedMainCategory
    ? subcategories.filter(sub => sub.category_id === parseInt(selectedMainCategory))
    : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(form);

    try {
      const result = await updateDonation(donation.id, formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "寄付記録を更新しました");
        // 一覧ページにリダイレクト
        setTimeout(() => {
          router.push("/dashboard/donations");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Donation update error:", err);
      setError("寄付記録の更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ... (Error/Success messages) ... */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-4 flex items-start gap-3 animate-in fade-in-50 duration-300">
          <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mt-0.5">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900 p-4 flex items-start gap-3 animate-in fade-in-50 duration-300">
          <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              更新完了
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* セクション1: 基本情報 */}
      <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ring-1 ring-slate-900/5">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
          {/* 寄付金額 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              寄付金額（円） <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span className="text-sm font-bold">¥</span>
              </div>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="例: 10000"
                defaultValue={donation.amount}
                required
                min="1"
                step="1"
                disabled={isLoading}
                className="pl-8 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* 寄付の種類 */}
          <div className="space-y-2">
            <Label htmlFor="donationType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              寄付の種類 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                <FileText className="h-4 w-4" />
              </div>
              <Select
                name="donationType"
                value={donationType || undefined}
                onValueChange={setDonationType}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {DONATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 寄付日 */}
          <div className="space-y-2">
            <Label htmlFor="donationDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              寄付日 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                id="donationDate"
                name="donationDate"
                type="date"
                defaultValue={donation.donation_date}
                required
                disabled={isLoading}
                className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* 都道府県 */}
          <div className="space-y-2">
            <Label htmlFor="prefecture" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              都道府県 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                <MapPin className="h-4 w-4" />
              </div>
              <Select
                name="prefecture"
                value={prefecture || undefined}
                onValueChange={setPrefecture}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {PREFECTURES.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 市区町村 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="municipality" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              市区町村 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <Input
                id="municipality"
                name="municipality"
                type="text"
                placeholder="例: 札幌市、渋谷区"
                defaultValue={donation.municipality || ""}
                required
                maxLength={100}
                disabled={isLoading}
                className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              寄付先の市区町村名を入力してください
            </p>
          </div>

          {/* 返礼品 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="returnItem" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              返礼品 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Gift className="h-4 w-4" />
              </div>
              <Input
                id="returnItem"
                name="returnItem"
                type="text"
                placeholder="例: 和牛切り落とし 1kg、お米 10kg など"
                defaultValue={donation.return_item || ""}
                maxLength={200}
                required
                disabled={isLoading}
                className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* 返礼品カテゴリ */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                返礼品カテゴリ
              </Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* メインカテゴリ選択 */}
              <div className="space-y-2">
                <Label htmlFor="mainCategory" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  大カテゴリ
                </Label>
                <Select
                  value={selectedMainCategory}
                  onValueChange={setSelectedMainCategory}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* サブカテゴリ選択 */}
              <div className="space-y-2">
                <Label htmlFor="subcategoryId" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  小カテゴリ
                </Label>
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={setSelectedSubcategoryId}
                  disabled={isLoading || !selectedMainCategory}
                >
                  <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <SelectValue placeholder={selectedMainCategory ? "選択してください" : "大カテゴリを先に選択"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden input for formData */}
                <input type="hidden" name="subcategoryId" value={selectedSubcategoryId} />
              </div>
            </div>
          </div>

          {/* 商品URL */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">商品URL</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
              </div>
              <Input
                id="productUrl"
                name="productUrl"
                type="url"
                placeholder="例: https://..."
                defaultValue={donation.product_url || ""}
                maxLength={2048}
                disabled={isLoading}
                className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              返礼品の商品ページURL（さとふる、楽天ふるさと納税など）を保存できます（任意）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* セクション2: 詳細情報（折りたたみ） */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full flex items-center justify-between p-4 h-auto bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <StickyNote className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 dark:text-slate-200">詳細情報・メモ</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                寄付の種類、支払い方法、URL、メモなど
              </div>
            </div>
          </div>
          {isDetailsOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </Button>

        {isDetailsOpen && (
          <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ring-1 ring-slate-900/5 animate-in slide-in-from-top-2 duration-200">
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">


              {/* 支払い方法 */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700 dark:text-slate-300">支払い方法</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <Select
                    name="paymentMethod"
                    value={paymentMethod || undefined}
                    onValueChange={setPaymentMethod}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                      <SelectValue placeholder="選択してください（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ポータルサイト */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="portalSite" className="text-sm font-medium text-slate-700 dark:text-slate-300">ポータルサイト</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                    <Globe className="h-4 w-4" />
                  </div>
                  <Select
                    name="portalSite"
                    value={portalSite || undefined}
                    onValueChange={setPortalSite}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
                      <SelectValue placeholder="選択してください（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTAL_SITES.map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  寄付したポータルサイトを選択してください（任意）
                </p>
              </div>

              {/* 受領番号 */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="receiptNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">受領番号</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <Input
                    id="receiptNumber"
                    name="receiptNumber"
                    type="text"
                    placeholder="例: 2025-001234"
                    defaultValue={donation.receipt_number || ""}
                    maxLength={50}
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  受領証明書に記載されている番号（任意）
                </p>
              </div>



              {/* メモ */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">メモ</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="配送日や特記事項などを記録できます"
                  defaultValue={donation.notes || ""}
                  rows={4}
                  maxLength={500}
                  disabled={isLoading}
                  className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground pl-1">
                  任意で追加情報を入力できます（500文字以内）
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 更新ボタン */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">更新中...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              寄付記録を更新
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
