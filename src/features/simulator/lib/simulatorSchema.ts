import { z } from "zod";
import { PREFECTURES } from "@/shared/config/prefectures";

/**
 * シミュレーション入力のバリデーションスキーマ
 */
export const simulatorSchema = z.object({
  /**
   * 年収（給与収入・万円単位）
   * 範囲: 100万円 〜 3000万円
   */
  annualIncome: z
    .number({
      message: "年収は数値で入力してください",
    })
    .int({ message: "年収は整数で入力してください" })
    .min(100, { message: "年収は100万円以上で入力してください" })
    .max(3000, { message: "年収は3000万円以下で入力してください" }),

  /**
   * 配偶者の有無
   */
  hasSpouse: z.boolean({
    message: "配偶者の有無を選択してください",
  }),

  /**
   * 扶養家族の人数
   * 範囲: 0人 〜 10人
   */
  dependentsCount: z
    .number({
      message: "扶養家族の人数は数値で入力してください",
    })
    .int({ message: "扶養家族の人数は整数で入力してください" })
    .min(0, { message: "扶養家族の人数は0人以上で入力してください" })
    .max(10, { message: "扶養家族の人数は10人以下で入力してください" }),

  /**
   * 都道府県（オプション）
   */
  prefecture: z.enum(PREFECTURES).optional(),
});

/**
 * シミュレーション入力の型
 */
export type SimulatorInput = z.infer<typeof simulatorSchema>;

/**
 * シミュレーション結果の型
 */
export type SimulatorResult = {
  /**
   * 推定上限額（円）
   */
  estimatedLimit: number;

  /**
   * 安全ライン（円）- 推定上限額の80%
   */
  safeLimit: number;

  /**
   * 前提条件
   */
  assumptions: string[];

  /**
   * 注意事項
   */
  warnings: string[];
};
