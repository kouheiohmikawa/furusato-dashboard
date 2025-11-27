
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export type ReturnItemCategory = Database["public"]["Tables"]["return_item_categories"]["Row"];
export type ReturnItemSubcategory = Database["public"]["Tables"]["return_item_subcategories"]["Row"];

/**
 * 全てのメインカテゴリを取得
 */
export async function getReturnItemCategories(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("return_item_categories")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    return data;
}

/**
 * 全てのサブカテゴリを取得
 */
export async function getReturnItemSubcategories(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("return_item_subcategories")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching subcategories:", error);
        return [];
    }

    return data;
}
