import { estimateDetailedLimitYen } from "./calculateDetailedLimit";
import type { DetailedSimulatorInput } from "./detailedSimulatorSchema";
import { DisabilityType } from "./detailedSimulatorSchema";

/**
 * 家族構成パターンの型定義
 */
export interface FamilyPattern {
  label: string;
  description: string;
  config: Partial<DetailedSimulatorInput>;
}

/**
 * 早見表の行データ
 */
export interface LimitTableRow {
  annualIncome: number; // 万円単位
  limits: number[]; // 各家族構成パターンごとの控除上限額（円）
}

/**
 * 早見表で使用する家族構成パターン
 */
export const FAMILY_PATTERNS: FamilyPattern[] = [
  {
    label: "独身または共働き",
    description: "扶養家族なし",
    config: {
      hasSpouse: false,
      generalDependentsCount: 0,
      specificDependentsCount: 0,
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "夫婦",
    description: "配偶者に収入なし",
    config: {
      hasSpouse: true,
      spouseIncome: 0,
      generalDependentsCount: 0,
      specificDependentsCount: 0,
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "共働き+子1人",
    description: "高校生",
    config: {
      hasSpouse: false,
      generalDependentsCount: 1, // 高校生（16-18歳）
      specificDependentsCount: 0,
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "共働き+子1人",
    description: "大学生",
    config: {
      hasSpouse: false,
      generalDependentsCount: 0,
      specificDependentsCount: 1, // 大学生（19-22歳）
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "夫婦+子1人",
    description: "高校生",
    config: {
      hasSpouse: true,
      spouseIncome: 0,
      generalDependentsCount: 1, // 高校生（16-18歳）
      specificDependentsCount: 0,
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "共働き+子2人",
    description: "大学生と高校生",
    config: {
      hasSpouse: false,
      generalDependentsCount: 1, // 高校生
      specificDependentsCount: 1, // 大学生
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
  {
    label: "夫婦+子2人",
    description: "大学生と高校生",
    config: {
      hasSpouse: true,
      spouseIncome: 0,
      generalDependentsCount: 1, // 高校生
      specificDependentsCount: 1, // 大学生
      elderlyDependentsCount: 0,
      elderlyLivingTogetherDependentsCount: 0,
    },
  },
];

/**
 * 基本入力値（早見表計算用のデフォルト値）
 */
const BASE_INPUT: Partial<DetailedSimulatorInput> = {
  // 社会保険料は自動推定（年収の14.4%）
  socialInsuranceDeduction: undefined,
  // その他の控除は0
  smallScaleEnterpriseMutualAidDeduction: 0,
  lifeInsuranceDeduction: 0,
  earthquakeInsuranceDeduction: 0,
  medicalExpenseDeduction: 0,
  donationDeduction: 0,
  housingLoanDeduction: 0,
  // 障害者控除なし
  selfDisability: DisabilityType.NONE,
  spouseDisability: DisabilityType.NONE,
  dependentOrdinaryDisabilityCount: 0,
  dependentSpecialDisabilityCount: 0,
  dependentSpecialLivingTogetherDisabilityCount: 0,
  // その他の人的控除なし
  isWidow: false,
  isSingleParent: false,
  isWorkingStudent: false,
  // 都道府県未指定
  prefecture: undefined,
};

/**
 * 早見表データを生成する
 * @param startIncome 開始年収（万円）
 * @param endIncome 終了年収（万円）
 * @param step 刻み幅（万円）
 * @returns 早見表の行データ配列
 */
export function generateLimitTable(
  startIncome: number = 300,
  endIncome: number = 2500,
  step: number = 25
): LimitTableRow[] {
  const rows: LimitTableRow[] = [];

  for (let income = startIncome; income <= endIncome; income += step) {
    const limits = FAMILY_PATTERNS.map((pattern) => {
      const input: DetailedSimulatorInput = {
        annualIncome: income,
        ...BASE_INPUT,
        ...pattern.config,
      } as DetailedSimulatorInput;

      return estimateDetailedLimitYen(input);
    });

    rows.push({
      annualIncome: income,
      limits,
    });
  }

  return rows;
}

/**
 * 控除上限額を千円単位の文字列にフォーマット
 * @param limitYen 控除上限額（円）
 * @returns フォーマットされた文字列（例: "28,000円"）
 */
export function formatLimit(limitYen: number): string {
  return `${limitYen.toLocaleString()}円`;
}
