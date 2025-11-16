import type { DetailedSimulatorInput } from "./detailedSimulatorSchema";
import type { SimulatorResult } from "./simulatorSchema";
import { DisabilityType } from "./detailedSimulatorSchema";

/**
 * 値を指定範囲内にクリップする
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 給与所得控除額を計算する（令和2年以降）
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
 * 社会保険料控除額を推定する（給与収入の約14.4%）
 */
function estimateSocialInsuranceDeduction(income: number): number {
  return Math.floor(income * 0.144);
}

/**
 * 基礎控除額を取得する（令和2年以降）
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
 * 配偶者控除額を取得する（配偶者の所得が48万円以下）
 */
function getSpouseDeduction(income: number): number {
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
 * 配偶者特別控除額を取得する（配偶者の所得が48万円超133万円以下）
 */
function getSpouseSpecialDeduction(
  taxpayerIncome: number,
  spouseIncome: number
): number {
  // 配偶者の給与所得を計算
  const spouseIncomeYen = spouseIncome * 10000;
  const spouseEmploymentDeduction =
    calculateEmploymentIncomeDeduction(spouseIncomeYen);
  const spouseNetIncome = spouseIncomeYen - spouseEmploymentDeduction;

  // 配偶者の所得が48万円以下なら配偶者控除を適用
  if (spouseNetIncome <= 480_000) {
    return getSpouseDeduction(taxpayerIncome);
  }

  // 配偶者の所得が133万円超なら控除なし
  if (spouseNetIncome > 1_330_000) {
    return 0;
  }

  // 配偶者特別控除の計算
  // 納税者の所得が900万円以下の場合
  if (taxpayerIncome <= 9_000_000) {
    if (spouseNetIncome <= 950_000) return 380_000;
    if (spouseNetIncome <= 1_000_000) return 360_000;
    if (spouseNetIncome <= 1_050_000) return 310_000;
    if (spouseNetIncome <= 1_100_000) return 260_000;
    if (spouseNetIncome <= 1_150_000) return 210_000;
    if (spouseNetIncome <= 1_200_000) return 160_000;
    if (spouseNetIncome <= 1_250_000) return 110_000;
    if (spouseNetIncome <= 1_300_000) return 60_000;
    if (spouseNetIncome <= 1_330_000) return 30_000;
  }
  // 納税者の所得が900万円超950万円以下の場合
  else if (taxpayerIncome <= 9_500_000) {
    if (spouseNetIncome <= 950_000) return 260_000;
    if (spouseNetIncome <= 1_000_000) return 240_000;
    if (spouseNetIncome <= 1_050_000) return 210_000;
    if (spouseNetIncome <= 1_100_000) return 180_000;
    if (spouseNetIncome <= 1_150_000) return 140_000;
    if (spouseNetIncome <= 1_200_000) return 110_000;
    if (spouseNetIncome <= 1_250_000) return 80_000;
    if (spouseNetIncome <= 1_300_000) return 40_000;
    if (spouseNetIncome <= 1_330_000) return 20_000;
  }
  // 納税者の所得が950万円超1000万円以下の場合
  else if (taxpayerIncome <= 10_000_000) {
    if (spouseNetIncome <= 950_000) return 130_000;
    if (spouseNetIncome <= 1_000_000) return 120_000;
    if (spouseNetIncome <= 1_050_000) return 110_000;
    if (spouseNetIncome <= 1_100_000) return 90_000;
    if (spouseNetIncome <= 1_150_000) return 70_000;
    if (spouseNetIncome <= 1_200_000) return 60_000;
    if (spouseNetIncome <= 1_250_000) return 40_000;
    if (spouseNetIncome <= 1_300_000) return 20_000;
    if (spouseNetIncome <= 1_330_000) return 10_000;
  }

  return 0;
}

/**
 * 扶養控除額を計算する（年齢区分別）
 */
function getDependentsDeduction(
  generalCount: number,
  specificCount: number,
  elderlyCount: number,
  elderlyLivingTogetherCount: number
): number {
  return (
    generalCount * 380_000 + // 一般の扶養親族
    specificCount * 630_000 + // 特定扶養親族（19-23歳未満）
    elderlyCount * 480_000 + // 老人扶養親族（別居）
    elderlyLivingTogetherCount * 580_000 // 老人扶養親族（同居）
  );
}

/**
 * 障害者控除額を計算する
 */
function getDisabilityDeduction(
  selfDisability: string | undefined,
  spouseDisability: string | undefined,
  ordinaryCount: number,
  specialCount: number,
  specialLivingTogetherCount: number
): number {
  let total = 0;

  // 本人
  if (selfDisability === DisabilityType.ORDINARY) total += 270_000;
  if (selfDisability === DisabilityType.SPECIAL) total += 400_000;

  // 配偶者
  if (spouseDisability === DisabilityType.ORDINARY) total += 270_000;
  if (spouseDisability === DisabilityType.SPECIAL) total += 400_000;
  if (spouseDisability === DisabilityType.SPECIAL_LIVING_TOGETHER)
    total += 750_000;

  // 扶養親族
  total += (ordinaryCount || 0) * 270_000; // 普通障害者
  total += (specialCount || 0) * 400_000; // 特別障害者
  total += (specialLivingTogetherCount || 0) * 750_000; // 同居特別障害者

  return total;
}

/**
 * その他の人的控除額を計算する
 */
function getOtherPersonalDeductions(
  isWidow: boolean,
  isSingleParent: boolean,
  isWorkingStudent: boolean
): number {
  let total = 0;

  // ひとり親控除（35万円）- 寡婦控除より優先
  if (isSingleParent) {
    total += 350_000;
  }
  // 寡婦控除（27万円）
  else if (isWidow) {
    total += 270_000;
  }

  // 勤労学生控除（27万円）
  if (isWorkingStudent) {
    total += 270_000;
  }

  return total;
}

/**
 * 所得税率と控除額を取得する
 */
function getIncomeTaxRate(
  taxableIncome: number
): { rate: number; deduction: number } {
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
 * 詳細版：ふるさと納税の控除上限額を計算する
 */
export function estimateDetailedLimitYen(
  input: DetailedSimulatorInput
): number {
  const {
    annualIncome,
    hasSpouse,
    spouseIncome,
    generalDependentsCount,
    specificDependentsCount,
    elderlyDependentsCount,
    elderlyLivingTogetherDependentsCount,
    socialInsuranceDeduction: inputSocialInsurance,
    smallScaleEnterpriseMutualAidDeduction,
    lifeInsuranceDeduction,
    earthquakeInsuranceDeduction,
    medicalExpenseDeduction,
    donationDeduction,
    housingLoanDeduction,
    selfDisability,
    spouseDisability,
    dependentOrdinaryDisabilityCount,
    dependentSpecialDisabilityCount,
    dependentSpecialLivingTogetherDisabilityCount,
    isWidow,
    isSingleParent,
    isWorkingStudent,
  } = input;

  // 万円単位から円単位に変換
  const annualIncomeYen = annualIncome * 10000;

  // 1. 給与所得控除を計算
  const employmentDeduction =
    calculateEmploymentIncomeDeduction(annualIncomeYen);

  // 2. 給与所得を算出
  const employmentIncome = annualIncomeYen - employmentDeduction;

  // 3. 社会保険料控除（実際の金額または推定値）
  const socialInsurance =
    inputSocialInsurance !== undefined && inputSocialInsurance > 0
      ? inputSocialInsurance
      : estimateSocialInsuranceDeduction(annualIncomeYen);

  // 4. 所得控除の合計を計算
  const basicDeduction = getBasicDeduction(employmentIncome);

  // 配偶者控除・配偶者特別控除
  let spouseRelatedDeduction = 0;
  if (hasSpouse) {
    if (spouseIncome !== undefined && spouseIncome > 0) {
      spouseRelatedDeduction = getSpouseSpecialDeduction(
        employmentIncome,
        spouseIncome
      );
    } else {
      // 配偶者の収入が未入力の場合は配偶者控除を適用（年収103万円以下と仮定）
      spouseRelatedDeduction = getSpouseDeduction(employmentIncome);
    }
  }

  // 扶養控除
  const dependentsDeduction = getDependentsDeduction(
    generalDependentsCount,
    specificDependentsCount,
    elderlyDependentsCount,
    elderlyLivingTogetherDependentsCount
  );

  // 障害者控除
  const disabilityDeduction = getDisabilityDeduction(
    selfDisability,
    spouseDisability,
    dependentOrdinaryDisabilityCount || 0,
    dependentSpecialDisabilityCount || 0,
    dependentSpecialLivingTogetherDisabilityCount || 0
  );

  // その他の人的控除
  const otherPersonalDeductions = getOtherPersonalDeductions(
    isWidow || false,
    isSingleParent || false,
    isWorkingStudent || false
  );

  // 小規模企業共済等掛金控除
  const mutualAidDeduction = smallScaleEnterpriseMutualAidDeduction || 0;

  // 生命保険料控除
  const lifeInsurance = lifeInsuranceDeduction || 0;

  // 地震保険料控除
  const earthquakeInsurance = earthquakeInsuranceDeduction || 0;

  // 医療費控除
  const medicalExpense = medicalExpenseDeduction || 0;

  // 寄付金控除（ふるさと納税以外）
  const donation = donationDeduction || 0;

  // 所得控除の合計
  const totalDeductions =
    basicDeduction +
    spouseRelatedDeduction +
    dependentsDeduction +
    disabilityDeduction +
    otherPersonalDeductions +
    socialInsurance +
    mutualAidDeduction +
    lifeInsurance +
    earthquakeInsurance +
    medicalExpense +
    donation;

  // 5. 課税所得を算出（最低0円）
  const taxableIncome = Math.max(0, employmentIncome - totalDeductions);

  // 課税所得が0の場合、ふるさと納税の控除上限額は2,000円（自己負担額のみ）
  if (taxableIncome === 0) {
    return 2000;
  }

  // 6. 所得税率を決定
  const { rate: incomeTaxRate, deduction: incomeTaxDeduction } =
    getIncomeTaxRate(taxableIncome);

  // 7. 所得税額を計算
  let incomeTax = Math.floor(taxableIncome * incomeTaxRate - incomeTaxDeduction);

  // 8. 住宅ローン控除を適用（税額控除）
  const housingLoan = housingLoanDeduction || 0;
  incomeTax = Math.max(0, incomeTax - housingLoan);

  // 9. 復興特別所得税を加算（所得税額の2.1%）
  const reconstructionTax = Math.floor(incomeTax * 0.021);
  const totalIncomeTax = incomeTax + reconstructionTax;

  // 10. 住民税所得割額を計算（課税所得 × 10%）
  const residentTaxIncomeLevy = Math.floor(taxableIncome * 0.1);

  // 11. 住民税の調整控除を計算（簡易計算）
  // 課税所得200万円以下: min(人的控除額の差の合計, 課税所得) × 5%
  // 課税所得200万円超: max(人的控除額の差の合計 - (課税所得 - 200万円), 0) × 5%
  // ※ここでは簡易的に一律2,500円と仮定
  const adjustmentDeduction = 2500;

  // 12. 住民税額を計算
  let residentTax = Math.max(0, residentTaxIncomeLevy - adjustmentDeduction);

  // 住民税からも住宅ローン控除を適用（所得税から控除しきれなかった分）
  const remainingHousingLoan = Math.max(
    0,
    housingLoan - (incomeTax + reconstructionTax)
  );
  residentTax = Math.max(0, residentTax - remainingHousingLoan);

  // 13. ふるさと納税控除上限額を算出
  // 控除上限額 = (住民税所得割額 × 20%) / (100% - 10% - 所得税率 × 1.021) + 2,000円
  const limit =
    Math.floor((residentTax * 0.2) / (0.9 - incomeTaxRate * 1.021)) + 2000;

  // 現実的な範囲にクリップ（2,000円 〜 10,000,000円）
  return clamp(limit, 2000, 10_000_000);
}

/**
 * 安全ライン（推定上限額の80%）を計算する
 */
export function calculateSafeLimit(estimatedLimit: number): number {
  return Math.round(estimatedLimit * 0.8);
}

/**
 * 詳細版シミュレーション結果を生成する
 */
export function simulateDetailedLimit(
  input: DetailedSimulatorInput
): SimulatorResult {
  const estimatedLimit = estimateDetailedLimitYen(input);
  const safeLimit = calculateSafeLimit(estimatedLimit);

  // 前提条件
  const assumptions: string[] = [
    "給与収入のみを想定しています",
    "基礎控除・給与所得控除は令和2年以降の税制を適用しています",
  ];

  if (
    input.socialInsuranceDeduction === undefined ||
    input.socialInsuranceDeduction === 0
  ) {
    assumptions.push("社会保険料控除は給与収入の14.4%で推定しています");
  } else {
    assumptions.push("社会保険料控除は入力された金額を使用しています");
  }

  if (input.hasSpouse && (input.spouseIncome === undefined || input.spouseIncome === 0)) {
    assumptions.push(
      "配偶者は配偶者控除の対象（年収103万円以下）と仮定しています"
    );
  }

  // 注意事項
  const warnings: string[] = [
    "この金額はあくまで目安です",
    "正確な金額は、源泉徴収票や確定申告書類をもとに計算してください",
  ];

  if (input.housingLoanDeduction && input.housingLoanDeduction > 0) {
    warnings.push(
      "住宅ローン控除により、ふるさと納税の控除上限額が下がっている可能性があります"
    );
  }

  return {
    estimatedLimit,
    safeLimit,
    assumptions,
    warnings,
  };
}
