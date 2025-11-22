"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PREFECTURES } from "@/shared/config/prefectures";
import {
  simulatorSchema,
  type SimulatorInput,
  type SimulatorResult,
} from "../lib/simulatorSchema";
import { simulateLimit } from "../lib/calculateLimit";

type SimulatorFormProps = {
  onResult: (result: SimulatorResult, inputData: SimulatorInput) => void;
};

export function SimulatorForm({ onResult }: SimulatorFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SimulatorInput>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      annualIncome: undefined,
      hasSpouse: false,
      dependentsCount: 0,
      prefecture: undefined,
    },
  });

  const hasSpouse = watch("hasSpouse");

  const onSubmit = (data: SimulatorInput) => {
    setIsCalculating(true);

    // 計算実行
    const result = simulateLimit(data);

    // 少し遅延させてローディング状態を見せる（UX向上）
    setTimeout(() => {
      onResult(result, data);
      setIsCalculating(false);
    }, 300);
  };

  return (
    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          控除額シミュレーション
        </CardTitle>
        <CardDescription>
          年収や家族構成を入力して、ふるさと納税の控除上限額の目安を計算します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 年収 */}
          <div className="space-y-2">
            <Label htmlFor="annualIncome" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              年収<span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span className="text-sm font-bold">¥</span>
              </div>
              <Input
                id="annualIncome"
                type="number"
                placeholder="500"
                {...register("annualIncome", {
                  valueAsNumber: true,
                })}
                className={`pl-8 pr-12 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.annualIncome ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                万円
              </div>
            </div>
            {errors.annualIncome && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {errors.annualIncome.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground pl-1">
              例: 年収500万円の場合は「500」と入力
            </p>
          </div>

          {/* 配偶者の有無 */}
          <div className="space-y-2">
            <Label htmlFor="hasSpouse" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              配偶者<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={hasSpouse ? "true" : "false"}
              onValueChange={(value) => setValue("hasSpouse", value === "true")}
            >
              <SelectTrigger
                id="hasSpouse"
                className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">なし</SelectItem>
                <SelectItem value="true">あり</SelectItem>
              </SelectContent>
            </Select>
            {errors.hasSpouse && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {errors.hasSpouse.message}
              </p>
            )}
          </div>

          {/* 扶養家族の人数 */}
          <div className="space-y-2">
            <Label htmlFor="dependentsCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              扶養家族の人数<span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="dependentsCount"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                {...register("dependentsCount", {
                  valueAsNumber: true,
                })}
                className={`pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.dependentsCount ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                人
              </div>
            </div>
            {errors.dependentsCount && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {errors.dependentsCount.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground pl-1">
              配偶者以外の扶養家族（子供など）
            </p>
          </div>

          {/* 都道府県（オプション） */}
          <div className="space-y-2">
            <Label htmlFor="prefecture" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              都道府県（任意）
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("prefecture", value as SimulatorInput["prefecture"])
              }
            >
              <SelectTrigger
                id="prefecture"
                className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
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
            <p className="text-xs text-muted-foreground pl-1">
              現在は計算に影響しませんが、将来の機能拡張で使用予定です
            </p>
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <span className="mr-2">計算中...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              "控除額を計算する"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
