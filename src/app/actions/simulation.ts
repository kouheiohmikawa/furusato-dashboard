"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SimulatorInput } from "@/features/simulator/lib/simulatorSchema";
import type { DetailedSimulatorInput } from "@/features/simulator/lib/detailedSimulatorSchema";
import type { SimulatorResult } from "@/features/simulator/lib/simulatorSchema";

/**
 * シミュレーション結果を保存
 */
export async function saveSimulation(
  simulationType: "simple" | "detailed",
  inputData: SimulatorInput | DetailedSimulatorInput,
  resultData: SimulatorResult
) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "認証が必要です",
    };
  }

  try {
    // シミュレーション履歴を保存
    // @ts-ignore - Supabase type inference issue in build mode
    const { error } = await supabase.from("simulation_history").insert({
      user_id: user.id,
      simulation_type: simulationType,
      input_data: inputData as any,
      result_data: resultData as any,
    });

    if (error) {
      console.error("Simulation save error:", error);
      return {
        error: "シミュレーション結果の保存に失敗しました",
      };
    }

    revalidatePath("/dashboard/history");

    return {
      success: true,
      message: "シミュレーション結果を保存しました",
    };
  } catch (err) {
    console.error("Simulation save error:", err);
    return {
      error: "シミュレーション結果の保存に失敗しました",
    };
  }
}

/**
 * シミュレーション履歴を削除
 */
export async function deleteSimulation(id: string) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "認証が必要です",
    };
  }

  try {
    // 削除（RLSポリシーにより、自分の履歴のみ削除可能）
    const { error } = await supabase
      .from("simulation_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Simulation delete error:", error);
      return {
        error: "シミュレーション履歴の削除に失敗しました",
      };
    }

    revalidatePath("/dashboard/history");

    return {
      success: true,
      message: "シミュレーション履歴を削除しました",
    };
  } catch (err) {
    console.error("Simulation delete error:", err);
    return {
      error: "シミュレーション履歴の削除に失敗しました",
    };
  }
}
