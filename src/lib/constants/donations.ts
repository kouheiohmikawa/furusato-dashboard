/**
 * 寄付記録関連の定数
 */

/**
 * 寄付の種類
 */
export const DONATION_TYPES = [
  "返礼品あり",
  "返礼品なし（純粋な寄付）",
  "災害支援",
] as const;

export type DonationType = typeof DONATION_TYPES[number];

/**
 * 支払い方法
 */
export const PAYMENT_METHODS = [
  "クレジットカード",
  "銀行振込",
  "コンビニ決済",
  "その他",
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

/**
 * ポータルサイト
 */
export const PORTAL_SITES = [
  "ふるさとチョイス",
  "楽天ふるさと納税",
  "さとふる",
  "ふるなび",
  "ANAのふるさと納税",
  "au PAY ふるさと納税",
  "JALふるさと納税",
  "ふるさとプレミアム",
  "その他",
] as const;

export type PortalSite = typeof PORTAL_SITES[number];
