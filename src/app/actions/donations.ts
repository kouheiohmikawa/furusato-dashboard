"use server";

/**
 * 寄付記録関連のServer Actions
 *
 * 寄付情報の登録・更新・削除処理を行います。
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DonationInsert, DonationUpdate } from "@/types/database.types";
import { createDonationSchema, updateDonationSchema } from "@/lib/validations/donations";
import { getFormValue, getFormNumber, sanitizeTextarea } from "@/lib/sanitize";

/**
 * 寄付記録登録処理
 */
export async function createDonation(formData: FormData) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    // 入力値のバリデーション
    const validationResult = createDonationSchema.safeParse({
      prefecture: getFormValue(formData, "prefecture"),
      municipality: getFormValue(formData, "municipality"),
      donationDate: getFormValue(formData, "donationDate"),
      amount: getFormNumber(formData, "amount"),
      donationType: getFormValue(formData, "donationType") || null,
      paymentMethod: getFormValue(formData, "paymentMethod") || null,
      portalSite: getFormValue(formData, "portalSite") || null,
      receiptNumber: getFormValue(formData, "receiptNumber") || null,
      returnItem: getFormValue(formData, "returnItem") || null,
      notes: sanitizeTextarea(formData.get("notes") as string || "") || null,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const {
      prefecture,
      municipality,
      donationDate,
      amount,
      donationType,
      paymentMethod,
      portalSite,
      receiptNumber,
      returnItem,
      notes,
    } = validationResult.data;

    // 寄付記録を登録
    const newDonation: DonationInsert = {
      user_id: user.id,
      prefecture,
      municipality,
      municipality_name: `${prefecture}${municipality}`, // 後方互換性のため
      donation_date: donationDate,
      amount,
      donation_type: donationType,
      payment_method: paymentMethod,
      portal_site: portalSite,
      receipt_number: receiptNumber,
      return_item: returnItem,
      notes,
    };

    // @ts-expect-error - Supabase type inference issue in build mode
    const { error } = await supabase.from("donations").insert(newDonation);

    if (error) {
      console.error("Donation creation error:", error);
      return { error: "寄付記録の登録に失敗しました" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/donations");

    return { success: true, message: "寄付記録を登録しました" };
  } catch (error) {
    console.error("[Create Donation Error]", error);
    return { error: "寄付記録の登録中にエラーが発生しました。もう一度お試しください。" };
  }
}

/**
 * 寄付記録更新処理
 */
export async function updateDonation(id: string, formData: FormData) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    // 入力値のバリデーション
    const validationResult = updateDonationSchema.safeParse({
      prefecture: getFormValue(formData, "prefecture"),
      municipality: getFormValue(formData, "municipality"),
      donationDate: getFormValue(formData, "donationDate"),
      amount: getFormNumber(formData, "amount"),
      donationType: getFormValue(formData, "donationType") || null,
      paymentMethod: getFormValue(formData, "paymentMethod") || null,
      portalSite: getFormValue(formData, "portalSite") || null,
      receiptNumber: getFormValue(formData, "receiptNumber") || null,
      returnItem: getFormValue(formData, "returnItem") || null,
      notes: sanitizeTextarea(formData.get("notes") as string || "") || null,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const {
      prefecture,
      municipality,
      donationDate,
      amount,
      donationType,
      paymentMethod,
      portalSite,
      receiptNumber,
      returnItem,
      notes,
    } = validationResult.data;

    // 寄付記録を更新（自分の記録のみ）
    const updateData: DonationUpdate = {
      prefecture,
      municipality,
      municipality_name: `${prefecture}${municipality}`, // 後方互換性のため
      donation_date: donationDate,
      amount,
      donation_type: donationType,
      payment_method: paymentMethod,
      portal_site: portalSite,
      receipt_number: receiptNumber,
      return_item: returnItem,
      notes,
    };

    const { error } = await supabase
      // @ts-expect-error - Supabase type inference issue
      .from("donations")
      // @ts-expect-error - Supabase type inference issue
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Donation update error:", error);
      return { error: "寄付記録の更新に失敗しました" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/donations");

    return { success: true, message: "寄付記録を更新しました" };
  } catch (error) {
    console.error("[Update Donation Error]", error);
    return { error: "寄付記録の更新中にエラーが発生しました。もう一度お試しください。" };
  }
}

/**
 * 寄付記録削除処理
 */
export async function deleteDonation(id: string) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    // 寄付記録を削除（自分の記録のみ）
    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Donation deletion error:", error);
      return { error: "寄付記録の削除に失敗しました" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/donations");

    return { success: true, message: "寄付記録を削除しました" };
  } catch (error) {
    console.error("[Delete Donation Error]", error);
    return { error: "寄付記録の削除中にエラーが発生しました。もう一度お試しください。" };
  }
}
