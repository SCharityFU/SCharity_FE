"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // We should safely fall back to an empty string to prevent build crashes
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
    
    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
