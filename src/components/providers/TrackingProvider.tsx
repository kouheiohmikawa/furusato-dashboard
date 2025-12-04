"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";

type TrackingContextType = {
    consentGiven: boolean;
    accept: () => void;
    decline: () => void;
};

const TrackingContext = createContext<TrackingContextType>({
    consentGiven: false,
    accept: () => { },
    decline: () => { },
});

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [consentGiven, setConsentGiven] = useState(false);
    const COOKIE_NAME = "furusato-cookie-consent";

    useEffect(() => {
        const consent = getCookie(COOKIE_NAME);
        if (consent === "true") {
            setConsentGiven(true);
        }
    }, []);

    const accept = () => {
        setCookie(COOKIE_NAME, "true", { maxAge: 60 * 60 * 24 * 365 });
        setConsentGiven(true);
    };

    const decline = () => {
        setCookie(COOKIE_NAME, "false", { maxAge: 60 * 60 * 24 * 365 });
        setConsentGiven(false);
    };

    return (
        <TrackingContext.Provider value={{ consentGiven, accept, decline }}>
            {children}
        </TrackingContext.Provider>
    );
};
