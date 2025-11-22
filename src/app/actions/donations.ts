"use server";

/**
 * 寄付記録関連のServer Actions
 *
 * 寄付情報の登録・更新・削除処理を行います。
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DonationInsert, DonationUpdate } from "@/types/database.types";

/**
 * 寄付記録登録処理
 */
export async function createDonation(formData: FormData) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const prefecture = formData.get("prefecture") as string;
  const municipality = formData.get("municipality") as string;
  const donationDate = formData.get("donationDate") as string;
  const amount = formData.get("amount") as string;
  const donationType = formData.get("donationType") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const portalSite = formData.get("portalSite") as string;
  const receiptNumber = formData.get("receiptNumber") as string;
  const notes = formData.get("notes") as string;

  // バリデーション
  if (!prefecture || prefecture.trim().length === 0) {
    return { error: "都道府県を選択してください" };
  }

  if (!municipality || municipality.trim().length === 0) {
    return { error: "市区町村を入力してください" };
  }

  if (!donationDate) {
    return { error: "寄付日を入力してください" };
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return { error: "寄付金額は正の数値で入力してください" };
  }

  // 寄付記録を登録
  const newDonation: DonationInsert = {
    user_id: user.id,
    prefecture: prefecture.trim(),
    municipality: municipality.trim(),
    municipality_name: `${prefecture.trim()}${municipality.trim()}`, // 後方互換性のため
    donation_date: donationDate,
    amount: Number(amount),
    donation_type: donationType || null,
    payment_method: paymentMethod || null,
    portal_site: portalSite || null,
    receipt_number: receiptNumber?.trim() || null,
    notes: notes?.trim() || null,
  };

  // @ts-ignore - Supabase type inference issue in build mode
  const { error } = await supabase.from("donations").insert(newDonation);

  if (error) {
    console.error("Donation creation error:", error);
    return { error: "寄付記録の登録に失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/donations");

  return { success: true, message: "寄付記録を登録しました" };
}

/**
 * 寄付記録更新処理
 */
export async function updateDonation(id: string, formData: FormData) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const prefecture = formData.get("prefecture") as string;
  const municipality = formData.get("municipality") as string;
  const donationDate = formData.get("donationDate") as string;
  const amount = formData.get("amount") as string;
  const donationType = formData.get("donationType") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const portalSite = formData.get("portalSite") as string;
  const receiptNumber = formData.get("receiptNumber") as string;
  const notes = formData.get("notes") as string;

  // バリデーション
  if (!prefecture || prefecture.trim().length === 0) {
    return { error: "都道府県を選択してください" };
  }

  if (!municipality || municipality.trim().length === 0) {
    return { error: "市区町村を入力してください" };
  }

  if (!donationDate) {
    return { error: "寄付日を入力してください" };
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return { error: "寄付金額は正の数値で入力してください" };
  }

  // 寄付記録を更新（自分の記録のみ）
  const updateData: DonationUpdate = {
    prefecture: prefecture.trim(),
    municipality: municipality.trim(),
    municipality_name: `${prefecture.trim()}${municipality.trim()}`, // 後方互換性のため
    donation_date: donationDate,
    amount: Number(amount),
    donation_type: donationType || null,
    payment_method: paymentMethod || null,
    portal_site: portalSite || null,
    receipt_number: receiptNumber?.trim() || null,
    notes: notes?.trim() || null,
  };

  const { error } = await supabase
    // @ts-ignore - Supabase type inference issue in build mode
    .from("donations")
    // @ts-ignore - Supabase type inference issue in build mode
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
}

/**
 * 寄付記録削除処理
 */
export async function deleteDonation(id: string) {
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
}
