"use client";

import { useTracking } from "@/components/providers/TrackingProvider";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

export const Amplitude = () => {
    const { consentGiven } = useTracking();

    if (!consentGiven || !AMPLITUDE_API_KEY) {
        return null;
    }

    return (
        <>
            <script
                src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
            />
            <script
                src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.23.2-min.js.gz"
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
                        window.amplitude.init('${AMPLITUDE_API_KEY}', {
                            "autocapture": {"elementInteractions": true}
                        });
                    `,
                }}
            />
        </>
    );
};
