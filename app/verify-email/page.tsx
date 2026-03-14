"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmailMutation } from "@/lib/store/features/auth/authApi";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getSafeApiErrorMessage } from "@/lib/api-error";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    
    const [verifyEmail] = useVerifyEmailMutation();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Đường dẫn xác thực không hợp lệ hoặc đã thiếu mã token.");
            return;
        }

        const verify = async () => {
            try {
                await verifyEmail({ token }).unwrap();
                setStatus("success");
                setMessage("Tài khoản của bạn đã được xác thực thành công!");
                toast.success("Tài khoản của bạn đã được xác thực thành công!");
                
                // Optional: auto-redirect after 3s
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } catch (err: unknown) {
                setStatus("error");
                const errorMessage = getSafeApiErrorMessage(
                    err,
                    "Xác thực thất bại. Đường dẫn có thể đã hết hạn hoặc không hợp lệ."
                );
                setMessage(errorMessage);
                toast.error(errorMessage);
            }
        };

        verify();
    }, [token, verifyEmail, router]);

    return (
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md text-center">
            {status === "loading" && (
                <div className="flex flex-col items-center space-y-4 text-zinc-600">
                    <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                    <h2 className="text-xl font-google-sans-bold gradient-text">Đang xác thực...</h2>
                    <p className="text-sm">Vui lòng đợi trong giây lát.</p>
                </div>
            )}

            {status === "success" && (
                <div className="flex flex-col items-center space-y-4 text-green-600">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-google-sans-bold">Tuyệt vời!</h2>
                    <p className="text-zinc-600 font-google-sans-medium">{message}</p>
                    <p className="text-xs text-zinc-400">Đang tự động chuyển hướng đến trang đăng nhập...</p>
                    <Link
                        href="/login"
                        className="mt-6 inline-block bg-zinc-900 text-white px-8 py-3 rounded-full font-google-sans-bold hover:bg-rose-600 transition-colors w-full"
                    >
                        Đăng Nhập Ngay
                    </Link>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center space-y-4 text-rose-600">
                    <XCircle className="w-16 h-16 text-rose-500" />
                    <h2 className="text-2xl font-google-sans-bold">Ối, có lỗi rồi!</h2>
                    <p className="text-zinc-600 font-google-sans-medium">{message}</p>
                    <Link
                        href="/login"
                        className="mt-6 inline-block bg-zinc-900 text-white px-8 py-3 rounded-full font-google-sans-bold hover:bg-zinc-800 transition-colors w-full"
                    >
                        Quay lại Đăng Nhập
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center relative bg-zinc-50 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/20 rounded-full blur-[100px] -z-10" />

            <Suspense fallback={
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
