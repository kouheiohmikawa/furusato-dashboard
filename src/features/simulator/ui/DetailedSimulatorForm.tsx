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
    <Card>
      <CardHeader>
        <CardTitle>詳細シミュレーション</CardTitle>
        <CardDescription>
          詳細な控除情報を入力することで、より正確な控除上限額を計算できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">基本情報</h3>

            {/* 年収 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-annualIncome">
                年収<span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="detailed-annualIncome"
                  type="number"
                  placeholder="500"
                  {...register("annualIncome", {
                    valueAsNumber: true,
                  })}
                  className={errors.annualIncome ? "border-red-500" : ""}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  万円
                </span>
              </div>
              {errors.annualIncome && (
                <p className="text-sm text-red-500">{errors.annualIncome.message}</p>
              )}
            </div>

            {/* 配偶者の有無 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-hasSpouse">
                配偶者<span className="text-red-500">*</span>
              </Label>
              <Select
                value={hasSpouse ? "true" : "false"}
                onValueChange={(value) => setValue("hasSpouse", value === "true")}
              >
                <SelectTrigger id="detailed-hasSpouse">
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
              <div className="space-y-2">
                <Label htmlFor="detailed-spouseIncome">配偶者の年収</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-spouseIncome"
                    type="number"
                    placeholder="0"
                    {...register("spouseIncome", {
                      valueAsNumber: true,
                    })}
                    className={errors.spouseIncome ? "border-red-500" : ""}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    万円
                  </span>
                </div>
                {errors.spouseIncome && (
                  <p className="text-sm text-red-500">{errors.spouseIncome.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  ※配偶者控除・配偶者特別控除の計算に使用します（未入力の場合は103万円以下と仮定）
                </p>
              </div>
            )}

            {/* 都道府県 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-prefecture">都道府県</Label>
              <Select
                value={prefecture ?? ""}
                onValueChange={(value) => setValue("prefecture", value as any)}
              >
                <SelectTrigger id="detailed-prefecture">
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
              <p className="text-xs text-muted-foreground">
                ※将来的に自治体ごとの税率の差を反映予定（現在は未使用）
              </p>
            </div>
          </div>

          {/* 扶養親族セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">扶養親族</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* 一般の扶養親族 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-generalDependentsCount">
                  一般の扶養親族
                </Label>
                <Input
                  id="detailed-generalDependentsCount"
                  type="number"
                  placeholder="0"
                  {...register("generalDependentsCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  16歳以上19歳未満、23歳以上70歳未満
                </p>
              </div>

              {/* 特定扶養親族 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-specificDependentsCount">
                  特定扶養親族
                </Label>
                <Input
                  id="detailed-specificDependentsCount"
                  type="number"
                  placeholder="0"
                  {...register("specificDependentsCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">19歳以上23歳未満</p>
              </div>

              {/* 老人扶養親族（別居） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-elderlyDependentsCount">
                  老人扶養親族（別居）
                </Label>
                <Input
                  id="detailed-elderlyDependentsCount"
                  type="number"
                  placeholder="0"
                  {...register("elderlyDependentsCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">70歳以上</p>
              </div>

              {/* 老人扶養親族（同居） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-elderlyLivingTogetherDependentsCount">
                  老人扶養親族（同居）
                </Label>
                <Input
                  id="detailed-elderlyLivingTogetherDependentsCount"
                  type="number"
                  placeholder="0"
                  {...register("elderlyLivingTogetherDependentsCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">70歳以上・同居</p>
              </div>
            </div>
          </div>

          {/* 障害者控除セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">障害者控除</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* 本人の障害者控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-selfDisability">本人</Label>
                <Select
                  value={selfDisability ?? DisabilityType.NONE}
                  onValueChange={(value) => setValue("selfDisability", value as any)}
                >
                  <SelectTrigger id="detailed-selfDisability">
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
                <div className="space-y-2">
                  <Label htmlFor="detailed-spouseDisability">配偶者</Label>
                  <Select
                    value={spouseDisability ?? DisabilityType.NONE}
                    onValueChange={(value) => setValue("spouseDisability", value as any)}
                  >
                    <SelectTrigger id="detailed-spouseDisability">
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
                <Label htmlFor="detailed-dependentOrdinaryDisabilityCount">
                  障害者（扶養親族）
                </Label>
                <Input
                  id="detailed-dependentOrdinaryDisabilityCount"
                  type="number"
                  placeholder="0"
                  {...register("dependentOrdinaryDisabilityCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">27万円/人</p>
              </div>

              {/* 特別障害者（扶養親族） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-dependentSpecialDisabilityCount">
                  特別障害者（扶養親族）
                </Label>
                <Input
                  id="detailed-dependentSpecialDisabilityCount"
                  type="number"
                  placeholder="0"
                  {...register("dependentSpecialDisabilityCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">40万円/人</p>
              </div>

              {/* 同居特別障害者（扶養親族） */}
              <div className="space-y-2">
                <Label htmlFor="detailed-dependentSpecialLivingTogetherDisabilityCount">
                  同居特別障害者（扶養親族）
                </Label>
                <Input
                  id="detailed-dependentSpecialLivingTogetherDisabilityCount"
                  type="number"
                  placeholder="0"
                  {...register("dependentSpecialLivingTogetherDisabilityCount", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">75万円/人</p>
              </div>
            </div>
          </div>

          {/* その他の人的控除セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">その他の人的控除</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* 寡婦控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-isWidow">寡婦控除</Label>
                <Select
                  value={watch("isWidow") ? "true" : "false"}
                  onValueChange={(value) => setValue("isWidow", value === "true")}
                >
                  <SelectTrigger id="detailed-isWidow">
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
                <Label htmlFor="detailed-isSingleParent">ひとり親控除</Label>
                <Select
                  value={watch("isSingleParent") ? "true" : "false"}
                  onValueChange={(value) => setValue("isSingleParent", value === "true")}
                >
                  <SelectTrigger id="detailed-isSingleParent">
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
                <Label htmlFor="detailed-isWorkingStudent">勤労学生控除</Label>
                <Select
                  value={watch("isWorkingStudent") ? "true" : "false"}
                  onValueChange={(value) => setValue("isWorkingStudent", value === "true")}
                >
                  <SelectTrigger id="detailed-isWorkingStudent">
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
            <h3 className="text-lg font-semibold border-b pb-2">所得控除</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* 社会保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-socialInsuranceDeduction">
                  社会保険料控除
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-socialInsuranceDeduction"
                    type="number"
                    placeholder="自動計算"
                    {...register("socialInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ※未入力の場合は年収の14.4%で推定
                </p>
              </div>

              {/* iDeCo等 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-smallScaleEnterpriseMutualAidDeduction">
                  iDeCo・小規模企業共済等
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-smallScaleEnterpriseMutualAidDeduction"
                    type="number"
                    placeholder="0"
                    {...register("smallScaleEnterpriseMutualAidDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
              </div>

              {/* 生命保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-lifeInsuranceDeduction">
                  生命保険料控除
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-lifeInsuranceDeduction"
                    type="number"
                    placeholder="0"
                    {...register("lifeInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">※最大12万円</p>
              </div>

              {/* 地震保険料控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-earthquakeInsuranceDeduction">
                  地震保険料控除
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-earthquakeInsuranceDeduction"
                    type="number"
                    placeholder="0"
                    {...register("earthquakeInsuranceDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">※最大5万円</p>
              </div>

              {/* 医療費控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-medicalExpenseDeduction">医療費控除</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-medicalExpenseDeduction"
                    type="number"
                    placeholder="0"
                    {...register("medicalExpenseDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
              </div>

              {/* 寄付金控除 */}
              <div className="space-y-2">
                <Label htmlFor="detailed-donationDeduction">
                  寄付金控除（ふるさと納税以外）
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="detailed-donationDeduction"
                    type="number"
                    placeholder="0"
                    {...register("donationDeduction", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    円
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 税額控除セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">税額控除</h3>

            {/* 住宅ローン控除 */}
            <div className="space-y-2">
              <Label htmlFor="detailed-housingLoanDeduction">住宅ローン控除</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="detailed-housingLoanDeduction"
                  type="number"
                  placeholder="0"
                  {...register("housingLoanDeduction", {
                    valueAsNumber: true,
                  })}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ※源泉徴収票の「住宅借入金等特別控除の額」を入力
              </p>
            </div>
          </div>

          {/* 計算ボタン */}
          <Button type="submit" className="w-full" disabled={isCalculating}>
            {isCalculating ? (
              <>計算中...</>
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
