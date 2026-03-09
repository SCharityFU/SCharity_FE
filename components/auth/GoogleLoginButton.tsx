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
                // Here we send the access token instead of id token to our backend
                // The backend will need to fetch profile via googleapis OR we fetch it here 
                // and exchange. Our current backend expects an idToken to verify, but 
                // implicitly useGoogleLogin returns an access_token.
                // We'll pass it to backend and let the backend handle the rest, or just send access_token.
                // NOTE: Next line assumes your backend can handle `idToken: tokenResponse.access_token` or you rename the dto.
                const result = await loginWithGoogle({
                    idToken: tokenResponse.access_token, // BE needs updating to accept access_token or fetch profile if using implicit flow
                }).unwrap();

                dispatch(setCredentials({
                    user: result.data.user,
                    token: result.data.accessToken
                }));

                localStorage.setItem("access_token", result.data.accessToken);
                localStorage.setItem("user_info", JSON.stringify(result.data.user));

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
