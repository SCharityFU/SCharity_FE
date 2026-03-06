"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials } from "@/lib/store/features/auth/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Simple demo: Restore token from localStorage on mount
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user_info");
        
        if (storedToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                dispatch(setCredentials({ user, token: storedToken }));
            } catch (error) {
                console.error("Failed to parse stored user info", error);
            }
        }
    }, [dispatch]);

    // Prevent hydration mismatch by optionally avoiding rendering until mounted
    // if strictly needed, but simply rendering children is fine for auth state.
    if (!isMounted) return null;

    return <>{children}</>;
}
