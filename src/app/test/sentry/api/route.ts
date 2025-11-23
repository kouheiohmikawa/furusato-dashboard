import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/**
 * Sentryテスト用API
 * サーバーサイドエラーのテスト
 */
export async function GET() {
  // 本番環境では404を返す
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    throw new Error("Test: Server-side error from API route");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        message: "サーバーエラーをSentryに送信しました！",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
