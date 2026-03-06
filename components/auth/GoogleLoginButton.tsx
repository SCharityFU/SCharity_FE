"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useLoginWithGoogleMutation } from "@/lib/store/features/auth/authApi";
import { setCredentials } from "@/lib/store/features/auth/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";

export function GoogleLoginButton() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [loginWithGoogle, { isLoading }] = useLoginWithGoogleMutation();

    const handleSuccess = async (response: any) => {
        if (!response.credential) return;

        try {
            // Demo: Send the Google ID token to the backend
            const result = await loginWithGoogle({
                idToken: response.credential,
            }).unwrap();

            // Backend returns user details & new access token
            dispatch(setCredentials({
                user: result.user,
                token: result.accessToken
            }));

            // Persist for refresh (Demo only - Consider HttpOnly cookies in production)
            localStorage.setItem("access_token", result.accessToken);
            localStorage.setItem("user_info", JSON.stringify(result.user));

            router.push("/"); // Redirect after login
        } catch (error) {
            console.error("Login failed:", error);
            // In a real app, show a toast notification here
        }
    };

    const handleError = () => {
        console.error("Google Login Failed");
    };

    return (
        <div className="flex flex-col items-center">
            {isLoading && <p className="mb-2 text-sm text-gray-500">Đang đăng nhập...</p>}
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap // Optional: Shows the Google OneTap popup
            />
        </div>
    );
}
