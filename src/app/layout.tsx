import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsentBanner } from "@/components/layout/CookieConsent";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ふるさと納税ダッシュボード | 寄付記録を簡単管理",
    template: "%s | ふるさと納税ダッシュボード",
  },
  description:
    "ふるさと納税の控除額シミュレーションと寄付管理を簡単に。複数のポータルをまたいだ寄付状況を一元管理し、確定申告をサポートします。",
  keywords: ["ふるさと納税", "管理", "シミュレーター", "控除額", "確定申告", "ダッシュボード"],
  authors: [{ name: "Furusato Dashboard Team" }],
  creator: "Furusato Dashboard",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://furusato-dashboard.com",
    title: "ふるさと納税ダッシュボード",
    description: "ふるさと納税の寄付管理と控除額シミュレーションを一元化。",
    siteName: "ふるさと納税ダッシュボード",
  },
  twitter: {
    card: "summary_large_image",
    title: "ふるさと納税ダッシュボード",
    description: "ふるさと納税の寄付管理と控除額シミュレーションを一元化。",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <Header isLoggedIn={!!user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
          <CookieConsentBanner />
        </div>
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-VQH3CPN8Z1"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-VQH3CPN8Z1');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
