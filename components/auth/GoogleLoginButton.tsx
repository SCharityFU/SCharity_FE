"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useLoginWithGoogleMutation } from "@/lib/store/features/auth/authApi";
import { setCredentials } from "@/lib/store/features/auth/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { LogIn } from "lucide-react";

export function GoogleLoginButton({ fullWidth = false }: { fullWidth?: boolean }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [loginWithGoogle, { isLoading }] = useLoginWithGoogleMutation();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Here we send the OAuth access token to our backend
                // The backend will need to handle this as an access token (e.g. fetch profile via googleapis
                // or exchange it appropriately), rather than treating it as an ID token.
                // NOTE: Ensure your backend DTO and logic expect `accessToken` here.
                const result = await loginWithGoogle({
                    accessToken: tokenResponse.access_token,
                }).unwrap();

                dispatch(setCredentials({
                    user: result.data.user,
                    token: result.data.accessToken
                }));

                router.push("/");
            } catch (error) {
                console.error("Login failed:", error);
            }
        },
        onError: () => console.error("Login Failed"),
    });

    return (
        <RainbowButton
            onClick={() => login()}
            colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
            duration={3}
            borderWidth={1.5}
            className={fullWidth ? "w-full text-xs" : "text-xs"}
            disabled={isLoading}
        >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
        </RainbowButton>
    );
}
