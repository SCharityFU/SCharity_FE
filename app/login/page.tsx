import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                <div className="flex flex-col space-y-1.5 p-6 text-center">
                    <h3 className="font-semibold tracking-tight text-2xl">Đăng Nhập</h3>
                    <p className="text-sm text-muted-foreground text-gray-500 dark:text-gray-400">
                        Chào mừng bạn trở lại với SCharity
                    </p>
                </div>
                <div className="p-6 pt-0 flex flex-col items-center">
                    <GoogleLoginButton />
                </div>
            </div>
        </div>
    );
}
