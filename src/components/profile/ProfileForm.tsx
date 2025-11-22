"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { PREFECTURES } from "@/lib/constants/prefectures";

type ProfileFormProps = {
  email: string;
  displayName: string;
  prefecture: string;
  manualLimit?: number | null;
};

export function ProfileForm({
  email,
  displayName: initialDisplayName,
  prefecture: initialPrefecture,
  manualLimit: initialManualLimit
}: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [prefecture, setPrefecture] = useState(initialPrefecture);
  const [manualLimit, setManualLimit] = useState(initialManualLimit?.toString() || "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await updateProfile(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "プロフィールを更新しました");
        // ダッシュボードの情報も更新されるようにする
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("プロフィールの更新に失敗しました");
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

      {/* メールアドレス（表示のみ） */}
      <div className="space-y-2">
        <Label>メールアドレス</Label>
        <Input
          type="email"
          value={email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          メールアドレスは変更できません
        </p>
      </div>

      {/* 表示名 */}
      <div className="space-y-2">
        <Label htmlFor="displayName">
          表示名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="例: 山田太郎"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={50}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          ダッシュボードに表示される名前です（50文字以内）
        </p>
      </div>

      {/* 都道府県 */}
      <div className="space-y-2">
        <Label htmlFor="prefecture">都道府県</Label>
        <Select
          name="prefecture"
          value={prefecture || undefined}
          onValueChange={setPrefecture}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="都道府県を選択（任意）" />
          </SelectTrigger>
          <SelectContent>
            {PREFECTURES.map((pref) => (
              <SelectItem key={pref} value={pref}>
                {pref}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          お住まいの都道府県を選択してください（任意）
        </p>
      </div>

      {/* 手動上限額設定 */}
      <div className="space-y-2">
        <Label htmlFor="manualLimit">
          控除上限額（手動設定）
        </Label>
        <div className="relative">
          <Input
            id="manualLimit"
            name="manualLimit"
            type="number"
            placeholder="例: 80000"
            value={manualLimit}
            onChange={(e) => setManualLimit(e.target.value)}
            min="0"
            step="1000"
            disabled={isLoading}
            className="pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            円
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          シミュレーション結果を上書きして、手動で上限額を設定できます。<br />
          空欄の場合はシミュレーション結果が使用されます。
        </p>
      </div>

      {/* 更新ボタン */}
      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">更新中...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              プロフィールを更新
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
