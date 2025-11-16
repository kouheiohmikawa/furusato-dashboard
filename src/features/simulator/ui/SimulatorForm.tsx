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
  onResult: (result: SimulatorResult) => void;
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
      onResult(result);
      setIsCalculating(false);
    }, 300);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>控除額シミュレーション</CardTitle>
        <CardDescription>
          年収や家族構成を入力して、ふるさと納税の控除上限額の目安を計算します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 年収 */}
          <div className="space-y-2">
            <Label htmlFor="annualIncome">
              年収（給与収入）<span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="annualIncome"
                type="number"
                placeholder="5000000"
                {...register("annualIncome", {
                  valueAsNumber: true,
                })}
                className={errors.annualIncome ? "border-red-500" : ""}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">円</span>
            </div>
            {errors.annualIncome && (
              <p className="text-sm text-red-500">{errors.annualIncome.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              例: 年収500万円の場合は「5000000」と入力
            </p>
          </div>

          {/* 配偶者の有無 */}
          <div className="space-y-2">
            <Label htmlFor="hasSpouse">
              配偶者<span className="text-red-500">*</span>
            </Label>
            <Select
              value={hasSpouse ? "true" : "false"}
              onValueChange={(value) => setValue("hasSpouse", value === "true")}
            >
              <SelectTrigger id="hasSpouse">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">なし</SelectItem>
                <SelectItem value="true">あり</SelectItem>
              </SelectContent>
            </Select>
            {errors.hasSpouse && (
              <p className="text-sm text-red-500">{errors.hasSpouse.message}</p>
            )}
          </div>

          {/* 扶養家族の人数 */}
          <div className="space-y-2">
            <Label htmlFor="dependentsCount">
              扶養家族の人数<span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="dependentsCount"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                {...register("dependentsCount", {
                  valueAsNumber: true,
                })}
                className={errors.dependentsCount ? "border-red-500" : ""}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">人</span>
            </div>
            {errors.dependentsCount && (
              <p className="text-sm text-red-500">{errors.dependentsCount.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              配偶者以外の扶養家族（子供など）
            </p>
          </div>

          {/* 都道府県（オプション） */}
          <div className="space-y-2">
            <Label htmlFor="prefecture">都道府県（任意）</Label>
            <Select
              onValueChange={(value) =>
                setValue("prefecture", value as SimulatorInput["prefecture"])
              }
            >
              <SelectTrigger id="prefecture">
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
            <p className="text-xs text-muted-foreground">
              現在は計算に影響しませんが、将来の機能拡張で使用予定です
            </p>
          </div>

          {/* 送信ボタン */}
          <Button type="submit" className="w-full" disabled={isCalculating}>
            {isCalculating ? "計算中..." : "控除額を計算する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
