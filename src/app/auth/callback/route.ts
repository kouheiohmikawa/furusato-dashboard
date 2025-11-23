import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 認証コールバックハンドラー
 *
 * メール確認後にSupabaseからリダイレクトされるエンドポイント。
 * コードを検証し、セッションを確立します。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // セッション確立後、プロフィールを作成（存在しない場合）
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // プロフィールが存在するか確認
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        // プロフィールが存在しない場合は作成
        if (!profile) {
          // @ts-expect-error - Supabase type inference issue
          await supabase.from("profiles").insert({
            id: user.id,
            display_name: user.email?.split("@")[0] || "ユーザー",
          } as unknown);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // エラーの場合はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=認証に失敗しました`);
}
