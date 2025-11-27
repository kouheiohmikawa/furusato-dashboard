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
  "特定事業支援",
] as const;

export type DonationType = typeof DONATION_TYPES[number];

/**
 * 支払い方法
 */
export const PAYMENT_METHODS = [
  "クレジットカード",
  "銀行振込",
  "コンビニ決済",
  "PayPay",
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
  "直接申込",
] as const;

export type PortalSite = typeof PORTAL_SITES[number];

/**
 * ポータルサイトのURLパターン（自動検出用）
 */
export const PORTAL_SITE_URL_PATTERNS: Record<string, string[]> = {
  "ふるさとチョイス": ["furusato-tax.jp", "furu-sato.com"],
  "楽天ふるさと納税": ["rakuten.co.jp/f/"],
  "さとふる": ["satofull.jp"],
  "ふるなび": ["furunavi.jp"],
  "ANAのふるさと納税": ["ana-furusato.com", "ana.co.jp/ja/jp/domestic/promotions/furusato"],
  "au PAY ふるさと納税": ["wowma.jp/camp/furusato", "aupay-furusato.auone.jp"],
  "JALふるさと納税": ["jal-furusato.com"],
  "ふるさとプレミアム": ["furusato-premium.com", "26p.jp"],
};

/**
 * URLからポータルサイトを自動検出
 */
export function detectPortalSiteFromUrl(url: string): PortalSite | null {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  for (const [siteName, patterns] of Object.entries(PORTAL_SITE_URL_PATTERNS)) {
    if (patterns.some(pattern => lowerUrl.includes(pattern))) {
      return siteName as PortalSite;
    }
  }

  return null;
}


