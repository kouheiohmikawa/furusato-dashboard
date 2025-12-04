"use client";

import Script from "next/script";
import { useTracking } from "@/components/providers/TrackingProvider";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

export const GoogleAnalytics = () => {
    const { consentGiven } = useTracking();

    if (!consentGiven) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
            </Script>
        </>
    );
};
