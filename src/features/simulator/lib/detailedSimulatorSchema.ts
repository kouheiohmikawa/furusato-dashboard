import { z } from "zod";
import { PREFECTURES } from "@/shared/config/prefectures";

/**
 * 扶養親族の年齢区分
 */
export const DependentType = {
  GENERAL: "general", // 一般の扶養親族（38万円）
  SPECIFIC: "specific", // 特定扶養親族（19歳以上23歳未満）（63万円）
  ELDERLY: "elderly", // 老人扶養親族（70歳以上）（48万円）
  ELDERLY_LIVING_TOGETHER: "elderly_living_together", // 老人扶養親族（同居）（58万円）
} as const;

export type DependentType = (typeof DependentType)[keyof typeof DependentType];

/**
 * 障害者区分
 */
export const DisabilityType = {
  NONE: "none", // なし
  ORDINARY: "ordinary", // 普通障害者（27万円）
  SPECIAL: "special", // 特別障害者（40万円）
  SPECIAL_LIVING_TOGETHER: "special_living_together", // 同居特別障害者（75万円）
} as const;

export type DisabilityType = (typeof DisabilityType)[keyof typeof DisabilityType];

/**
 * 詳細版シミュレーション入力のバリデーションスキーマ
 */
export const detailedSimulatorSchema = z.object({
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
   * 配偶者の年収（万円単位・配偶者がいる場合のみ）
   * 範囲: 0万円 〜 201万円（201万円超は控除対象外）
   */
  spouseIncome: z
    .number({
      message: "配偶者の年収は数値で入力してください",
    })
    .int({ message: "配偶者の年収は整数で入力してください" })
    .min(0, { message: "配偶者の年収は0万円以上で入力してください" })
    .max(201, { message: "配偶者の年収は201万円以下で入力してください" })
    .optional(),

  /**
   * 一般の扶養親族の人数（16歳以上19歳未満、23歳以上70歳未満）
   */
  generalDependentsCount: z
    .number({
      message: "一般の扶養親族の人数は数値で入力してください",
    })
    .int({ message: "一般の扶養親族の人数は整数で入力してください" })
    .min(0, { message: "一般の扶養親族の人数は0人以上で入力してください" })
    .max(10, { message: "一般の扶養親族の人数は10人以下で入力してください" }),

  /**
   * 特定扶養親族の人数（19歳以上23歳未満）
   */
  specificDependentsCount: z
    .number({
      message: "特定扶養親族の人数は数値で入力してください",
    })
    .int({ message: "特定扶養親族の人数は整数で入力してください" })
    .min(0, { message: "特定扶養親族の人数は0人以上で入力してください" })
    .max(10, { message: "特定扶養親族の人数は10人以下で入力してください" }),

  /**
   * 老人扶養親族の人数（70歳以上・別居）
   */
  elderlyDependentsCount: z
    .number({
      message: "老人扶養親族の人数は数値で入力してください",
    })
    .int({ message: "老人扶養親族の人数は整数で入力してください" })
    .min(0, { message: "老人扶養親族の人数は0人以上で入力してください" })
    .max(10, { message: "老人扶養親族の人数は10人以下で入力してください" }),

  /**
   * 老人扶養親族の人数（70歳以上・同居）
   */
  elderlyLivingTogetherDependentsCount: z
    .number({
      message: "同居老人扶養親族の人数は数値で入力してください",
    })
    .int({ message: "同居老人扶養親族の人数は整数で入力してください" })
    .min(0, { message: "同居老人扶養親族の人数は0人以上で入力してください" })
    .max(10, { message: "同居老人扶養親族の人数は10人以下で入力してください" }),

  /**
   * 社会保険料控除額（円）
   * デフォルトは推定値を使用、実際の金額が分かる場合は入力
   */
  socialInsuranceDeduction: z
    .number({
      message: "社会保険料控除額は数値で入力してください",
    })
    .int({ message: "社会保険料控除額は整数で入力してください" })
    .min(0, { message: "社会保険料控除額は0円以上で入力してください" })
    .max(10_000_000, { message: "社会保険料控除額は1000万円以下で入力してください" })
    .optional(),

  /**
   * 小規模企業共済等掛金控除額（iDeCo等）（円）
   */
  smallScaleEnterpriseMutualAidDeduction: z
    .number({
      message: "小規模企業共済等掛金控除額は数値で入力してください",
    })
    .int({ message: "小規模企業共済等掛金控除額は整数で入力してください" })
    .min(0, { message: "小規模企業共済等掛金控除額は0円以上で入力してください" })
    .max(5_000_000, { message: "小規模企業共済等掛金控除額は500万円以下で入力してください" })
    .optional(),

  /**
   * 生命保険料控除額（円）
   * 最大12万円（新制度）
   */
  lifeInsuranceDeduction: z
    .number({
      message: "生命保険料控除額は数値で入力してください",
    })
    .int({ message: "生命保険料控除額は整数で入力してください" })
    .min(0, { message: "生命保険料控除額は0円以上で入力してください" })
    .max(120_000, { message: "生命保険料控除額は12万円以下で入力してください" })
    .optional(),

  /**
   * 地震保険料控除額（円）
   * 最大5万円
   */
  earthquakeInsuranceDeduction: z
    .number({
      message: "地震保険料控除額は数値で入力してください",
    })
    .int({ message: "地震保険料控除額は整数で入力してください" })
    .min(0, { message: "地震保険料控除額は0円以上で入力してください" })
    .max(50_000, { message: "地震保険料控除額は5万円以下で入力してください" })
    .optional(),

  /**
   * 医療費控除額（円）
   */
  medicalExpenseDeduction: z
    .number({
      message: "医療費控除額は数値で入力してください",
    })
    .int({ message: "医療費控除額は整数で入力してください" })
    .min(0, { message: "医療費控除額は0円以上で入力してください" })
    .max(10_000_000, { message: "医療費控除額は1000万円以下で入力してください" })
    .optional(),

  /**
   * 寄付金控除額（ふるさと納税以外）（円）
   */
  donationDeduction: z
    .number({
      message: "寄付金控除額は数値で入力してください",
    })
    .int({ message: "寄付金控除額は整数で入力してください" })
    .min(0, { message: "寄付金控除額は0円以上で入力してください" })
    .max(10_000_000, { message: "寄付金控除額は1000万円以下で入力してください" })
    .optional(),

  /**
   * 住宅ローン控除額（円）
   * これは税額控除なので、課税所得の計算後に適用
   */
  housingLoanDeduction: z
    .number({
      message: "住宅ローン控除額は数値で入力してください",
    })
    .int({ message: "住宅ローン控除額は整数で入力してください" })
    .min(0, { message: "住宅ローン控除額は0円以上で入力してください" })
    .max(500_000, { message: "住宅ローン控除額は50万円以下で入力してください" })
    .optional(),

  /**
   * 障害者控除（本人）
   */
  selfDisability: z.enum([
    DisabilityType.NONE,
    DisabilityType.ORDINARY,
    DisabilityType.SPECIAL,
  ] as const).optional(),

  /**
   * 障害者控除（配偶者）
   */
  spouseDisability: z.enum([
    DisabilityType.NONE,
    DisabilityType.ORDINARY,
    DisabilityType.SPECIAL,
    DisabilityType.SPECIAL_LIVING_TOGETHER,
  ] as const).optional(),

  /**
   * 障害者控除（扶養親族）の人数
   */
  dependentOrdinaryDisabilityCount: z
    .number({
      message: "障害者（扶養親族）の人数は数値で入力してください",
    })
    .int({ message: "障害者（扶養親族）の人数は整数で入力してください" })
    .min(0, { message: "障害者（扶養親族）の人数は0人以上で入力してください" })
    .max(10, { message: "障害者（扶養親族）の人数は10人以下で入力してください" })
    .optional(),

  /**
   * 特別障害者控除（扶養親族）の人数
   */
  dependentSpecialDisabilityCount: z
    .number({
      message: "特別障害者（扶養親族）の人数は数値で入力してください",
    })
    .int({ message: "特別障害者（扶養親族）の人数は整数で入力してください" })
    .min(0, { message: "特別障害者（扶養親族）の人数は0人以上で入力してください" })
    .max(10, { message: "特別障害者（扶養親族）の人数は10人以下で入力してください" })
    .optional(),

  /**
   * 同居特別障害者控除（扶養親族）の人数
   */
  dependentSpecialLivingTogetherDisabilityCount: z
    .number({
      message: "同居特別障害者（扶養親族）の人数は数値で入力してください",
    })
    .int({ message: "同居特別障害者（扶養親族）の人数は整数で入力してください" })
    .min(0, { message: "同居特別障害者（扶養親族）の人数は0人以上で入力してください" })
    .max(10, { message: "同居特別障害者（扶養親族）の人数は10人以下で入力してください" })
    .optional(),

  /**
   * 寡婦控除
   */
  isWidow: z.boolean().optional(),

  /**
   * ひとり親控除
   */
  isSingleParent: z.boolean().optional(),

  /**
   * 勤労学生控除
   */
  isWorkingStudent: z.boolean().optional(),

  /**
   * 都道府県（オプション）
   */
  prefecture: z.enum(PREFECTURES).optional(),
});

/**
 * 詳細版シミュレーション入力の型
 */
export type DetailedSimulatorInput = z.infer<typeof detailedSimulatorSchema>;
