/**
 * 寄付記録関連のバリデーションスキーマ
 *
 * Zodを使用した型安全な入力検証とビジネスルール
 */

import { z } from "zod";

/**
 * 都道府県のバリデーション
 */
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
] as const;

/**
 * 寄付種別
 */
const DONATION_TYPES = ["通常", "災害支援", "特定事業支援"] as const;

/**
 * 支払方法
 */
const PAYMENT_METHODS = [
  "クレジットカード",
  "銀行振込",
  "コンビニ決済",
  "PayPay",
  "その他"
] as const;

/**
 * ポータルサイト
 */
const PORTAL_SITES = [
  "ふるさとチョイス",
  "楽天ふるさと納税",
  "さとふる",
  "ふるなび",
  "au PAY ふるさと納税",
  "その他",
  "直接申込"
] as const;

/**
 * 都道府県スキーマ
 */
export const prefectureSchema = z.enum(PREFECTURES, {
  message: "有効な都道府県を選択してください",
});

/**
 * 市区町村スキーマ
 */
export const municipalitySchema = z
  .string()
  .min(1, "市区町村を入力してください")
  .max(50, "市区町村は50文字以内で入力してください")
  .regex(
    /^[ぁ-んァ-ヶー一-龯々〆〤0-9０-９a-zA-Z　 \-ー]+$/,
    "市区町村名に使用できない文字が含まれています"
  )
  .trim();

/**
 * 寄付日スキーマ
 */
export const donationDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません（YYYY-MM-DD）")
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 今日の終わりまで許可

      // 妥当な日付かチェック
      if (isNaN(date.getTime())) {
        return false;
      }

      // 2008年以降（ふるさと納税制度開始）から今日まで
      const minDate = new Date("2008-01-01");
      return date >= minDate && date <= today;
    },
    {
      message: "寄付日は2008年1月1日から今日までの日付を入力してください",
    }
  );

/**
 * 寄付金額スキーマ
 */
export const amountSchema = z
  .number({
    message: "寄付金額は数値で入力してください",
  })
  .int("寄付金額は整数で入力してください")
  .min(1000, "寄付金額は1,000円以上で入力してください")
  .max(10000000, "寄付金額は10,000,000円以下で入力してください");

/**
 * 寄付種別スキーマ
 */
export const donationTypeSchema = z
  .enum(DONATION_TYPES, {
    message: "有効な寄付種別を選択してください",
  })
  .nullable()
  .optional();

/**
 * 支払方法スキーマ
 */
export const paymentMethodSchema = z
  .enum(PAYMENT_METHODS, {
    message: "有効な支払方法を選択してください",
  })
  .nullable()
  .optional();

/**
 * ポータルサイトスキーマ
 */
export const portalSiteSchema = z
  .enum(PORTAL_SITES, {
    message: "有効なポータルサイトを選択してください",
  })
  .nullable()
  .optional();

/**
 * 受領番号スキーマ
 */
export const receiptNumberSchema = z
  .string()
  .max(100, "受領番号は100文字以内で入力してください")
  .regex(
    /^[a-zA-Z0-9\-_]+$/,
    "受領番号は半角英数字、ハイフン、アンダースコアのみ使用できます"
  )
  .trim()
  .nullable()
  .optional()
  .or(z.literal(""));

/**
 * 備考スキーマ
 */
export const notesSchema = z
  .string()
  .max(500, "備考は500文字以内で入力してください")
  .trim()
  .nullable()
  .optional()
  .or(z.literal(""));

/**
 * 寄付記録作成スキーマ
 */
export const createDonationSchema = z.object({
  prefecture: prefectureSchema,
  municipality: municipalitySchema,
  donationDate: donationDateSchema,
  amount: amountSchema,
  donationType: donationTypeSchema,
  paymentMethod: paymentMethodSchema,
  portalSite: portalSiteSchema,
  receiptNumber: receiptNumberSchema,
  notes: notesSchema,
});

/**
 * 寄付記録更新スキーマ（作成と同じ）
 */
export const updateDonationSchema = createDonationSchema;

/**
 * 型エクスポート
 */
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;

/**
 * 定数エクスポート
 */
export { PREFECTURES, DONATION_TYPES, PAYMENT_METHODS, PORTAL_SITES };
