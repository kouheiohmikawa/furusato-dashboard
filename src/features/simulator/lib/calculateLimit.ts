import type { SimulatorInput, SimulatorResult } from "./simulatorSchema";

/**
 * 値を指定範囲内にクリップする
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 給与所得控除額を計算する（令和2年以降）
 *
 * @param income - 給与収入（円）
 * @returns 給与所得控除額（円）
 */
function calculateEmploymentIncomeDeduction(income: number): number {
  if (income <= 1_625_000) {
    return 550_000;
  } else if (income <= 1_800_000) {
    return Math.floor(income * 0.4 - 100_000);
  } else if (income <= 3_600_000) {
    return Math.floor(income * 0.3 + 80_000);
  } else if (income <= 6_600_000) {
    return Math.floor(income * 0.2 + 440_000);
  } else if (income <= 8_500_000) {
    return Math.floor(income * 0.1 + 1_100_000);
  } else {
    return 1_950_000; // 上限
  }
}

/**
 * 社会保険料控除額を推定する
 * 健康保険・厚生年金・雇用保険の合計を給与収入の約14.4%と仮定
 *
 * @param income - 給与収入（円）
 * @returns 社会保険料控除額（円）
 */
function estimateSocialInsuranceDeduction(income: number): number {
  return Math.floor(income * 0.144);
}

/**
 * 基礎控除額を取得する（令和2年以降）
 *
 * @param income - 合計所得金額（円）
 * @returns 基礎控除額（円）
 */
function getBasicDeduction(income: number): number {
  if (income <= 24_000_000) {
    return 480_000;
  } else if (income <= 24_500_000) {
    return 320_000;
  } else if (income <= 25_000_000) {
    return 160_000;
  } else {
    return 0;
  }
}

/**
 * 配偶者控除額を取得する
 * 配偶者の所得が48万円以下（給与収入103万円以下）と仮定
 *
 * @param hasSpouse - 配偶者の有無
 * @param income - 納税者の合計所得金額（円）
 * @returns 配偶者控除額（円）
 */
function getSpouseDeduction(hasSpouse: boolean, income: number): number {
  if (!hasSpouse) return 0;

  if (income <= 9_000_000) {
    return 380_000;
  } else if (income <= 9_500_000) {
    return 260_000;
  } else if (income <= 10_000_000) {
    return 130_000;
  } else {
    return 0;
  }
}

/**
 * 扶養控除額を計算する
 * 全員一般の扶養親族（38万円）と仮定
 *
 * @param dependentsCount - 扶養親族の人数
 * @returns 扶養控除額（円）
 */
function getDependentsDeduction(dependentsCount: number): number {
  return dependentsCount * 380_000;
}

/**
 * 所得税率と控除額を取得する
 *
 * @param taxableIncome - 課税所得（円）
 * @returns { rate: 税率, deduction: 控除額 }
 */
function getIncomeTaxRate(taxableIncome: number): { rate: number; deduction: number } {
  if (taxableIncome <= 1_950_000) {
    return { rate: 0.05, deduction: 0 };
  } else if (taxableIncome <= 3_300_000) {
    return { rate: 0.1, deduction: 97_500 };
  } else if (taxableIncome <= 6_950_000) {
    return { rate: 0.2, deduction: 427_500 };
  } else if (taxableIncome <= 9_000_000) {
    return { rate: 0.23, deduction: 636_000 };
  } else if (taxableIncome <= 18_000_000) {
    return { rate: 0.33, deduction: 1_536_000 };
  } else if (taxableIncome <= 40_000_000) {
    return { rate: 0.4, deduction: 2_796_000 };
  } else {
    return { rate: 0.45, deduction: 4_796_000 };
  }
}

/**
 * ふるさと納税の控除上限額を計算する（v2.0 精密モデル）
 *
 * @param input - シミュレーション入力パラメータ
 * @returns 推定上限額（円）
 *
 * 計算フロー:
 * 1. 給与所得控除を計算
 * 2. 給与所得を算出（給与収入 - 給与所得控除）
 * 3. 社会保険料控除を推定
 * 4. 所得控除の合計を計算（基礎控除 + 配偶者控除 + 扶養控除 + 社会保険料控除）
 * 5. 課税所得を算出（給与所得 - 所得控除合計）
 * 6. 所得税率を決定
 * 7. 住民税所得割額を計算
 * 8. ふるさと納税控除上限額を算出
 *
 * 計算式:
 * 控除上限額 = (住民税所得割額 × 20%) / (100% - 10% - 所得税率 × 1.021) + 2,000円
 */
export function estimateLimitYen(input: SimulatorInput): number {
  const { annualIncome, hasSpouse, dependentsCount } = input;

  // 1. 給与所得控除を計算
  const employmentDeduction = calculateEmploymentIncomeDeduction(annualIncome);

  // 2. 給与所得を算出
  const employmentIncome = annualIncome - employmentDeduction;

  // 3. 社会保険料控除を推定
  const socialInsuranceDeduction = estimateSocialInsuranceDeduction(annualIncome);

  // 4. 所得控除の合計を計算
  const basicDeduction = getBasicDeduction(employmentIncome);
  const spouseDeduction = getSpouseDeduction(hasSpouse, employmentIncome);
  const dependentsDeduction = getDependentsDeduction(dependentsCount);

  const totalDeductions =
    basicDeduction +
    spouseDeduction +
    dependentsDeduction +
    socialInsuranceDeduction;

  // 5. 課税所得を算出（最低0円）
  const taxableIncome = Math.max(0, employmentIncome - totalDeductions);

  // 課税所得が0の場合、ふるさと納税の控除上限額は2,000円（自己負担額のみ）
  if (taxableIncome === 0) {
    return 2000;
  }

  // 6. 所得税率を決定
  const { rate: incomeTaxRate } = getIncomeTaxRate(taxableIncome);

  // 7. 住民税所得割額を計算（課税所得 × 10%）
  const residentTaxIncomeLevy = Math.floor(taxableIncome * 0.1);

  // 8. ふるさと納税控除上限額を算出
  // 控除上限額 = (住民税所得割額 × 20%) / (100% - 10% - 所得税率 × 1.021) + 2,000円
  const limit = Math.floor(
    (residentTaxIncomeLevy * 0.2) / (0.9 - incomeTaxRate * 1.021)
  ) + 2000;

  // 現実的な範囲にクリップ（2,000円 〜 10,000,000円）
  return clamp(limit, 2000, 10_000_000);
}

/**
 * 安全ライン（推定上限額の80%）を計算する
 *
 * @param estimatedLimit - 推定上限額
 * @returns 安全ライン（円）
 */
export function calculateSafeLimit(estimatedLimit: number): number {
  return Math.round(estimatedLimit * 0.8);
}

/**
 * シミュレーション結果を生成する
 *
 * @param input - シミュレーション入力パラメータ
 * @returns シミュレーション結果
 */
export function simulateLimit(input: SimulatorInput): SimulatorResult {
  const estimatedLimit = estimateLimitYen(input);
  const safeLimit = calculateSafeLimit(estimatedLimit);

  // 前提条件
  const assumptions: string[] = [
    "給与収入のみを想定しています",
    "社会保険料控除は給与収入の14.4%で推定しています",
    "配偶者は配偶者控除の対象（年収103万円以下）と仮定しています",
    "扶養親族は一般の扶養親族として計算しています",
    "基礎控除・給与所得控除は令和2年以降の税制を適用しています",
  ];

  // 注意事項
  const warnings: string[] = [
    "この金額はあくまで目安です",
    "住宅ローン控除や医療費控除など、他の控除がある場合は実際の上限額が下がります",
    "配偶者に収入がある場合（配偶者特別控除の対象）は計算が異なります",
    "扶養親族の年齢や特定扶養親族の有無により控除額が変わる場合があります",
    "正確な金額は、源泉徴収票や確定申告書類をもとに計算してください",
  ];

  return {
    estimatedLimit,
    safeLimit,
    assumptions,
    warnings,
  };
}
