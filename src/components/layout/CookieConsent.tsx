"use client";

import CookieConsent from "react-cookie-consent";
import Link from "next/link";

/**
 * Cookie同意バナー
 *
 * サイト下部に表示されるCookie使用の同意を求めるバナー
 * ユーザーに同意または拒否の選択肢を提供
 */
export function CookieConsentBanner() {
  const handleAccept = () => {
    // 将来的にGoogle Analyticsなどの解析ツールを有効化
    console.log("Cookie consent: accepted");
  };

  const handleDecline = () => {
    // 将来的にGoogle Analyticsなどの解析ツールを無効化
    console.log("Cookie consent: declined");
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText="同意する"
      declineButtonText="拒否する"
      enableDeclineButton
      cookieName="furusato-cookie-consent"
      style={{
        background: "linear-gradient(to right, #1e293b, #334155)",
        padding: "20px",
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
      }}
      buttonStyle={{
        background: "#3b82f6",
        color: "#fff",
        fontSize: "14px",
        borderRadius: "8px",
        padding: "12px 28px",
        fontWeight: "600",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        border: "none",
        cursor: "pointer",
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "#cbd5e1",
        fontSize: "14px",
        borderRadius: "8px",
        padding: "12px 28px",
        fontWeight: "600",
        border: "1px solid #475569",
        cursor: "pointer",
      }}
      buttonWrapperClasses="flex gap-3 items-center"
      onAccept={handleAccept}
      onDecline={handleDecline}
      expires={365}
      overlay
    >
      <span className="text-sm text-white">
        当サイトでは、サービスの改善とアクセス解析のためCookieを使用しています。
        <Link
          href="/privacy"
          className="underline ml-1 font-medium hover:text-blue-200 transition-colors"
        >
          詳細はこちら
        </Link>
      </span>
    </CookieConsent>
  );
}
