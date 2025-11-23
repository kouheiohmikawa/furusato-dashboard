"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  detailedSimulatorSchema,
  type DetailedSimulatorInput,
  DisabilityType,
} from "../lib/detailedSimulatorSchema";
import { PREFECTURES } from "@/shared/config/prefectures";
import { simulateDetailedLimit } from "../lib/calculateDetailedLimit";
import type { SimulatorResult } from "../lib/simulatorSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DetailedSimulatorFormProps {
  onResult: (result: SimulatorResult, inputData: DetailedSimulatorInput) => void;
}

export function DetailedSimulatorForm({ onResult }: DetailedSimulatorFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DetailedSimulatorInput>({
    resolver: zodResolver(detailedSimulatorSchema),
    defaultValues: {
      annualIncome: undefined,
      hasSpouse: false,
      spouseIncome: undefined,
      generalDependentsCount: 0,
      specificDependentsCount: 0,
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
      socialInsuranceDeduction: undefined,
      smallScaleEnterpriseMutualAidDeduction: undefined,
      lifeInsuranceDeduction: undefined,
      earthquakeInsuranceDeduction: undefined,
      medicalExpenseDeduction: undefined,
      donationDeduction: undefined,
      housingLoanDeduction: undefined,
      selfDisability: DisabilityType.NONE,
      spouseDisability: DisabilityType.NONE,
      dependentOrdinaryDisabilityCount: undefined,
      dependentSpecialDisabilityCount: undefined,
      dependentSpecialLivingTogetherDisabilityCount: undefined,
      isWidow: false,
      isSingleParent: false,
      isWorkingStudent: false,
      prefecture: undefined,
    },
  });

  const hasSpouse = watch("hasSpouse");
  const selfDisability = watch("selfDisability");
  const spouseDisability = watch("spouseDisability");
  const prefecture = watch("prefecture");

  const onSubmit = (data: DetailedSimulatorInput) => {
    setIsCalculating(true);

    // 計算実行
    const result = simulateDetailedLimit(data);

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
          詳細シミュレーション
        </CardTitle>
        <CardDescription>
          詳細な控除情報を入力することで、より正確な控除上限額を計算できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 基本情報セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">基本情報</h3>
            </div>

            {/* 年収 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-annualIncome" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                年収<span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <span className="text-sm font-bold">¥</span>
                </div>
                <Input
                  id="detailed-annualIncome"
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
            </div>

            {/* 配偶者の有無 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-hasSpouse" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                配偶者<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={hasSpouse ? "true" : "false"}
                onValueChange={(value) => setValue("hasSpouse", value === "true")}
              >
                <SelectTrigger
                  id="detailed-hasSpouse"
                  className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">なし</SelectItem>
                  <SelectItem value="true">あり</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 配偶者の年収（配偶者がいる場合のみ表示） */}
            {hasSpouse && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="detailed-spouseIncome" className="text-sm font-medium text-slate-700 dark:text-slate-300">配偶者の年収</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <span className="text-sm font-bold">¥</span>
                  </div>
                  <Input
                    id="detailed-spouseIncome"
                    type="number"
                    placeholder="0"
                    {...register("spouseIncome", {
                      valueAsNumber: true,
                    })}
                    className={`pl-8 pr-12 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.spouseIncome ? "border-red-500 focus:ring-red-500/20" : ""
                      }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    万円
                  </div>
                </div>
                {errors.spouseIncome && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.spouseIncome.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground pl-1">
                  ※配偶者控除・配偶者特別控除の計算に使用します（未入力の場合は103万円以下と仮定）
                </p>
              </div>
            )}

            {/* 都道府県 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-prefecture" className="text-sm font-medium text-slate-700 dark:text-slate-300">都道府県</Label>
              <Select
                value={prefecture ?? ""}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(value) => setValue("prefecture", value as any)}
              >
                <SelectTrigger
                  id="detailed-prefecture"
                  className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <SelectValue placeholder="選択してください（任意）" />
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
                ※将来的に自治体ごとの税率の差を反映予定（現在は未使用）
              </p>
            </div>
          </div>

          {/* 扶養親族セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">扶養親族</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* 一般の扶養親族 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-generalDependentsCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  一般の扶養親族
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-generalDependentsCount"
                    type="number"
                    placeholder="0"
                    {...register("generalDependentsCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  16歳以上19歳未満、23歳以上70歳未満
                </p>
              </div>

              {/* 特定扶養親族 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-specificDependentsCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  特定扶養親族
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-specificDependentsCount"
                    type="number"
                    placeholder="0"
                    {...register("specificDependentsCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">19歳以上23歳未満</p>
              </div>

              {/* 老人扶養親族（別居） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-elderlyDependentsCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  老人扶養親族（別居）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-elderlyDependentsCount"
                    type="number"
                    placeholder="0"
                    {...register("elderlyDependentsCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">70歳以上</p>
              </div>

              {/* 老人扶養親族（同居） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-elderlyLivingTogetherDependentsCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  老人扶養親族（同居）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-elderlyLivingTogetherDependentsCount"
                    type="number"
                    placeholder="0"
                    {...register("elderlyLivingTogetherDependentsCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">70歳以上・同居</p>
              </div>
            </div>
          </div>

          {/* 障害者控除セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">障害者控除</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* 本人の障害者控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-selfDisability" className="text-sm font-medium text-slate-700 dark:text-slate-300">本人</Label>
                <Select
                  value={selfDisability ?? DisabilityType.NONE}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value) => setValue("selfDisability", value as any)}
                >
                  <SelectTrigger
                    id="detailed-selfDisability"
                    className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DisabilityType.NONE}>なし</SelectItem>
                    <SelectItem value={DisabilityType.ORDINARY}>障害者（27万円）</SelectItem>
                    <SelectItem value={DisabilityType.SPECIAL}>特別障害者（40万円）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 配偶者の障害者控除（配偶者がいる場合のみ表示） */}
              {hasSpouse && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="detailed-spouseDisability" className="text-sm font-medium text-slate-700 dark:text-slate-300">配偶者</Label>
                  <Select
                    value={spouseDisability ?? DisabilityType.NONE}
                    onValueChange={(value) => setValue("spouseDisability", value as DisabilityType)}
                  >
                    <SelectTrigger
                      id="detailed-spouseDisability"
                      className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DisabilityType.NONE}>なし</SelectItem>
                      <SelectItem value={DisabilityType.ORDINARY}>障害者（27万円）</SelectItem>
                      <SelectItem value={DisabilityType.SPECIAL}>特別障害者（40万円）</SelectItem>
                      <SelectItem value={DisabilityType.SPECIAL_LIVING_TOGETHER}>同居特別障害者（75万円）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 障害者（扶養親族） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-dependentOrdinaryDisabilityCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  障害者（扶養親族）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-dependentOrdinaryDisabilityCount"
                    type="number"
                    placeholder="0"
                    {...register("dependentOrdinaryDisabilityCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">27万円/人</p>
              </div>

              {/* 特別障害者（扶養親族） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-dependentSpecialDisabilityCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  特別障害者（扶養親族）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-dependentSpecialDisabilityCount"
                    type="number"
                    placeholder="0"
                    {...register("dependentSpecialDisabilityCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">40万円/人</p>
              </div>

              {/* 同居特別障害者（扶養親族） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-dependentSpecialLivingTogetherDisabilityCount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  同居特別障害者（扶養親族）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-dependentSpecialLivingTogetherDisabilityCount"
                    type="number"
                    placeholder="0"
                    {...register("dependentSpecialLivingTogetherDisabilityCount", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    人
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">75万円/人</p>
              </div>
            </div>
          </div>

          {/* その他の人的控除セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">その他の人的控除</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* 寡婦控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-isWidow" className="text-sm font-medium text-slate-700 dark:text-slate-300">寡婦控除</Label>
                <Select
                  value={watch("isWidow") ? "true" : "false"}
                  onValueChange={(value) => setValue("isWidow", value === "true")}
                >
                  <SelectTrigger
                    id="detailed-isWidow"
                    className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">対象外</SelectItem>
                    <SelectItem value="true">対象（27万円）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ひとり親控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-isSingleParent" className="text-sm font-medium text-slate-700 dark:text-slate-300">ひとり親控除</Label>
                <Select
                  value={watch("isSingleParent") ? "true" : "false"}
                  onValueChange={(value) => setValue("isSingleParent", value === "true")}
                >
                  <SelectTrigger
                    id="detailed-isSingleParent"
                    className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">対象外</SelectItem>
                    <SelectItem value="true">対象（35万円）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 勤労学生控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-isWorkingStudent" className="text-sm font-medium text-slate-700 dark:text-slate-300">勤労学生控除</Label>
                <Select
                  value={watch("isWorkingStudent") ? "true" : "false"}
                  onValueChange={(value) => setValue("isWorkingStudent", value === "true")}
                >
                  <SelectTrigger
                    id="detailed-isWorkingStudent"
                    className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">対象外</SelectItem>
                    <SelectItem value="true">対象（27万円）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 社会保険料・その他の控除セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">所得控除</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* 社会保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-socialInsuranceDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  社会保険料控除
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-socialInsuranceDeduction"
                    type="number"
                    placeholder="自動計算"
                    {...register("socialInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  ※未入力の場合は年収の14.4%で推定
                </p>
              </div>

              {/* iDeCo等 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-smallScaleEnterpriseMutualAidDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  iDeCo・小規模企業共済等
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-smallScaleEnterpriseMutualAidDeduction"
                    type="number"
                    placeholder="0"
                    {...register("smallScaleEnterpriseMutualAidDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
              </div>

              {/* 生命保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-lifeInsuranceDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  生命保険料控除
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-lifeInsuranceDeduction"
                    type="number"
                    placeholder="0"
                    {...register("lifeInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">※最大12万円</p>
              </div>

              {/* 地震保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-earthquakeInsuranceDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  地震保険料控除
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-earthquakeInsuranceDeduction"
                    type="number"
                    placeholder="0"
                    {...register("earthquakeInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">※最大5万円</p>
              </div>

              {/* 医療費控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-medicalExpenseDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">医療費控除</Label>
                <div className="relative">
                  <Input
                    id="detailed-medicalExpenseDeduction"
                    type="number"
                    placeholder="0"
                    {...register("medicalExpenseDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
              </div>

              {/* 寄付金控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-donationDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  寄付金控除（ふるさと納税以外）
                </Label>
                <div className="relative">
                  <Input
                    id="detailed-donationDeduction"
                    type="number"
                    placeholder="0"
                    {...register("donationDeduction", {
                      valueAsNumber: true,
                    })}
                    className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                    円
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 税額控除セクション */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">税額控除</h3>
            </div>

            {/* 住宅ローン控除 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-housingLoanDeduction" className="text-sm font-medium text-slate-700 dark:text-slate-300">住宅ローン控除</Label>
              <div className="relative">
                <Input
                  id="detailed-housingLoanDeduction"
                  type="number"
                  placeholder="0"
                  {...register("housingLoanDeduction", {
                    valueAsNumber: true,
                  })}
                  className="pr-10 h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                  円
                </div>
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                ※源泉徴収票の「住宅借入金等特別控除の額」を入力
              </p>
            </div>
          </div>

          {/* 計算ボタン */}
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
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-label="計算機アイコン"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                控除上限額を計算する
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
