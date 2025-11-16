import type { SimulatorInput, SimulatorResult } from "./simulatorSchema";

/**
 * 値を指定範囲内にクリップする
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * ふるさと納税の控除上限額を推定する（v1.0 簡易モデル）
 *
 * @param input - シミュレーション入力パラメータ
 * @returns 推定上限額（円）
 *
 * 計算方法:
 * 1. 基本係数: 独身・子なし想定で 0.10 (10%)
 * 2. 配偶者がいる場合: -0.01
 * 3. 扶養家族による調整: 1人につき -0.005 (最大3人まで)
 * 4. 下限ガード: 最低5%
 * 5. 上下限クリップ: 2,000円 〜 500,000円
 *
 * 注意: これは簡易モデルであり、実際の控除額は他の控除項目により変動します
 */
export function estimateLimitYen(input: SimulatorInput): number {
  // 基本係数: 独身・子なし想定で 0.10 (10%)
  let rate = 0.1;

  // 配偶者がいる場合: -0.01
  if (input.hasSpouse) {
    rate -= 0.01;
  }

  // 扶養家族による調整: 1人につき -0.005 (最大3人まで)
  const dependentsAdjustment = Math.min(input.dependentsCount, 3) * 0.005;
  rate -= dependentsAdjustment;

  // 下限ガード: 最低5%
  rate = Math.max(0.05, rate);

  // 計算
  const estimated = Math.round(input.annualIncome * rate);

  // 上下限クリップ: 2,000円 〜 500,000円
  return clamp(estimated, 2000, 500_000);
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
    "社会保険料控除は標準的な額を想定しています",
  ];

  // 注意事項
  const warnings: string[] = [
    "この金額はあくまで目安です",
    "住宅ローン控除や医療費控除など、他の控除がある場合は実際の上限額が変動します",
    "正確な金額は、確定申告書類や源泉徴収票をもとに計算してください",
  ];

  return {
    estimatedLimit,
    safeLimit,
    assumptions,
    warnings,
  };
}
