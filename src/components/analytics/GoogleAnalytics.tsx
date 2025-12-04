"use client";


import { useTracking } from "@/components/providers/TrackingProvider";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

export const GoogleAnalytics = () => {
    const { consentGiven } = useTracking();

    if (!consentGiven) {
        return null;
    }

    return (
        <>
            <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `,
                }}
            />
        </>
    );
};
