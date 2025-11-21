"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook for accessing public settings client-side
export function usePublicSettings() {
    const { data, error, isLoading } = useSWR("/api/settings/public", fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    return {
        settings: data || {},
        isLoading,
        error,
    };
}

// Helper to get a specific setting
export function useSetting(key: string, defaultValue: string = "") {
    const { settings, isLoading } = usePublicSettings();
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (settings[key]) {
            setValue(settings[key]);
        }
    }, [settings, key]);

    return { value, isLoading };
}
