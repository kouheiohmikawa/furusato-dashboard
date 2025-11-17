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
import { createDonation } from "@/app/actions/donations";
import { DONATION_TYPES, PAYMENT_METHODS } from "@/lib/constants/donations";

export function DonationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationType, setDonationType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(form);

    try {
      const result = await createDonation(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "寄付記録を登録しました");
        // 一覧ページにリダイレクト
        setTimeout(() => {
          router.push("/dashboard/donations");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Donation creation error:", err);
      setError("寄付記録の登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 成功メッセージ */}
      {success && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            {success}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 自治体名 */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="municipalityName">
            自治体名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="municipalityName"
            name="municipalityName"
            type="text"
            placeholder="例: 北海道札幌市"
            required
            maxLength={100}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            寄付先の自治体名を入力してください
          </p>
        </div>

        {/* 寄付日 */}
        <div className="space-y-2">
          <Label htmlFor="donationDate">
            寄付日 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="donationDate"
            name="donationDate"
            type="date"
            required
            disabled={isLoading}
          />
        </div>

        {/* 寄付金額 */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            寄付金額（円） <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="例: 10000"
            required
            min="1"
            step="1"
            disabled={isLoading}
          />
        </div>

        {/* 寄付の種類 */}
        <div className="space-y-2">
          <Label htmlFor="donationType">寄付の種類</Label>
          <Select
            name="donationType"
            value={donationType || undefined}
            onValueChange={setDonationType}
            disabled={isLoading}
          >
            <SelectTrigger>
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
          <Label htmlFor="paymentMethod">支払い方法</Label>
          <Select
            name="paymentMethod"
            value={paymentMethod || undefined}
            onValueChange={setPaymentMethod}
            disabled={isLoading}
          >
            <SelectTrigger>
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

        {/* 受領番号 */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receiptNumber">受領番号</Label>
          <Input
            id="receiptNumber"
            name="receiptNumber"
            type="text"
            placeholder="例: 2025-001234"
            maxLength={50}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            受領証明書に記載されている番号（任意）
          </p>
        </div>

        {/* メモ */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">メモ</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="返礼品の内容や特記事項などを記録できます"
            rows={4}
            maxLength={500}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            任意で追加情報を入力できます（500文字以内）
          </p>
        </div>
      </div>

      {/* 登録ボタン */}
      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">登録中...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              寄付記録を登録
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
