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
    <>
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

        <div className="space-y-6">
          {/* メールアドレス（表示のみ） */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">メールアドレス</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </div>
              <Input
                type="email"
                value={email}
                disabled
                className="pl-10 h-11 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-muted-foreground"
              />
            </div>
          </div>

          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              表示名 <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
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
                className="pl-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              ダッシュボードに表示される名前です
            </p>
          </div>

          {/* 都道府県 */}
          <div className="space-y-2">
            <Label htmlFor="prefecture" className="text-sm font-medium text-slate-700 dark:text-slate-300">都道府県</Label>
            <Select
              name="prefecture"
              value={prefecture || undefined}
              onValueChange={setPrefecture}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all">
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
            <p className="text-xs text-muted-foreground pl-1">
              お住まいの都道府県を選択してください
            </p>
          </div>

          {/* 手動上限額設定 */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <Label htmlFor="manualLimit" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  控除上限額の手動設定
                </Label>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                {/* プリセットボタン */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">クイック設定</Label>
                  <div className="flex flex-wrap gap-2">
                    {[30000, 50000, 80000, 100000, 150000, 200000].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setManualLimit(preset.toString())}
                        disabled={isLoading}
                        className="text-xs h-8 bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                      >
                        {(preset / 10000).toFixed(0)}万円
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setManualLimit("")}
                      disabled={isLoading}
                      className="text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      クリア
                    </Button>
                  </div>
                </div>

                {/* スライダー */}
                <div className="space-y-3 py-2">
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="10000"
                    value={manualLimit || "0"}
                    onChange={(e) => setManualLimit(e.target.value === "0" ? "" : e.target.value)}
                    disabled={isLoading}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>0円</span>
                    <span>15万円</span>
                    <span>30万円</span>
                  </div>
                </div>

                {/* 数値入力と増減ボタン */}
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(manualLimit || "0");
                      setManualLimit(Math.max(0, current - 10000).toString());
                    }}
                    disabled={isLoading || !manualLimit || parseInt(manualLimit) <= 0}
                    className="h-11 w-11 shrink-0 bg-white dark:bg-slate-950"
                  >
                    -
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      id="manualLimitDisplay"
                      type="text"
                      placeholder="直接入力も可能"
                      value={manualLimit ? parseInt(manualLimit).toLocaleString() : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        if (value === "" || /^\d+$/.test(value)) {
                          setManualLimit(value);
                        }
                      }}
                      disabled={isLoading}
                      className="pr-12 text-right h-11 text-lg font-medium bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <input
                      type="hidden"
                      id="manualLimit"
                      name="manualLimit"
                      value={manualLimit || ""}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      円
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(manualLimit || "0");
                      setManualLimit((current + 10000).toString());
                    }}
                    disabled={isLoading}
                    className="h-11 w-11 shrink-0 bg-white dark:bg-slate-950"
                  >
                    +
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5 text-blue-500"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
                  <p>
                    シミュレーション結果よりも、ここで設定した金額が優先してダッシュボードに表示されます。
                    未設定（クリア）の場合はシミュレーション結果が使用されます。
                  </p>
                </div>
              </div>
            </div>
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
                プロフィールを更新
              </>
            )}
          </Button>
        </div>
      </form>

      <DeleteAccountSection />
    </>
  );
}

function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // 動的インポートで循環参照を回避（必要であれば）
      const { deleteAccount } = await import("@/app/actions/account");
      await deleteAccount();
    } catch (error) {
      console.error("Delete account error:", error);
      setIsDeleting(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">アカウントの削除</h3>
          <p className="text-sm text-muted-foreground mt-1">
            アカウントと関連するすべてのデータを完全に削除します。この操作は取り消せません。
          </p>
        </div>

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="shrink-0">
              アカウントを削除する
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消すことができません。<br />
                あなたのプロフィール、寄付記録、シミュレーション履歴など、すべてのデータが永久に削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "削除中..." : "削除する"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
