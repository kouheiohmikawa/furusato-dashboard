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
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { updateDonation } from "@/app/actions/donations";
import { DONATION_TYPES, PAYMENT_METHODS, PORTAL_SITES } from "@/lib/constants/donations";
import { PREFECTURES } from "@/shared/config/prefectures";
import type { Donation } from "@/types/database.types";

type DonationEditFormProps = {
  donation: Donation;
};

export function DonationEditForm({ donation }: DonationEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prefecture, setPrefecture] = useState(donation.prefecture || "");
  const [donationType, setDonationType] = useState(donation.donation_type || "");
  const [paymentMethod, setPaymentMethod] = useState(donation.payment_method || "");
  const [portalSite, setPortalSite] = useState(donation.portal_site || "");
  const [hasOneStop, setHasOneStop] = useState(donation.has_one_stop || false);

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
      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-4 flex items-start gap-3 animate-in fade-in-50 duration-300">
          <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mt-0.5">{error}</p>
        </div>
      )}

      {/* 成功メッセージ */}
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* 都道府県 */}
        <div className="space-y-2">
          <Label htmlFor="prefecture" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            都道府県 <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            name="prefecture"
            value={prefecture || undefined}
            onValueChange={setPrefecture}
            disabled={isLoading}
            required
          >
            <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
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

        {/* 市区町村 */}
        <div className="space-y-2">
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

        {/* 寄付日 */}
        <div className="space-y-2">
          <Label htmlFor="donationDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            寄付日 <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
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

        {/* 寄付金額 */}
        <div className="space-y-2">
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
          <Label htmlFor="donationType" className="text-sm font-medium text-slate-700 dark:text-slate-300">寄付の種類</Label>
          <Select
            name="donationType"
            value={donationType || undefined}
            onValueChange={setDonationType}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <SelectValue placeholder="選択してください（任意）" />
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

        {/* 支払い方法 */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700 dark:text-slate-300">支払い方法</Label>
          <Select
            name="paymentMethod"
            value={paymentMethod || undefined}
            onValueChange={setPaymentMethod}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
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

        {/* ポータルサイト */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="portalSite" className="text-sm font-medium text-slate-700 dark:text-slate-300">ポータルサイト</Label>
          <Select
            name="portalSite"
            value={portalSite || undefined}
            onValueChange={setPortalSite}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
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
          <p className="text-xs text-muted-foreground pl-1">
            寄付したポータルサイトを選択してください（任意）
          </p>
        </div>

        {/* 受領番号 */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receiptNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">受領番号</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
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

        {/* 返礼品 */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="returnItem" className="text-sm font-medium text-slate-700 dark:text-slate-300">返礼品</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
            </div>
            <Input
              id="returnItem"
              name="returnItem"
              type="text"
              placeholder="例: 和牛切り落とし 1kg、お米 10kg など"
              defaultValue={donation.return_item || ""}
              maxLength={200}
              disabled={isLoading}
              className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            受け取った返礼品の内容を記録できます（任意）
          </p>
        </div>

        {/* ワンストップ特例制度 */}
        <div className="space-y-4 md:col-span-2 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasOneStop"
              name="hasOneStop"
              value="true"
              checked={hasOneStop}
              onChange={(e) => setHasOneStop(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="hasOneStop" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              ワンストップ特例制度を利用する
            </Label>
          </div>

          {hasOneStop && (
            <div className="grid gap-6 md:grid-cols-2 pl-6 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <Label htmlFor="oneStopSentDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  申請書送付日
                </Label>
                <Input
                  id="oneStopSentDate"
                  name="oneStopSentDate"
                  type="date"
                  defaultValue={donation.one_stop_sent_date || ""}
                  disabled={isLoading}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oneStopConfirmedDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  受領確認日
                </Label>
                <Input
                  id="oneStopConfirmedDate"
                  name="oneStopConfirmedDate"
                  type="date"
                  defaultValue={donation.one_stop_confirmed_date || ""}
                  disabled={isLoading}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
            </div>
          )}
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
