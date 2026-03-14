"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useResetPasswordMutation } from "@/lib/store/features/auth/authApi";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAnimatedToast } from "@/components/ui/animated-toast";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Chứa ít nhất một chữ hoa, một thường và một số"
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { addToast } = useAnimatedToast();

  const [resetPasswordApi, { isLoading }] = useResetPasswordMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
        const message = "Thiếu mã xác thực (Token) trong đường dẫn.";
        setServerError(message);
        addToast({
          type: "error",
          title: "Thiếu token",
          message,
        });
        return;
    }

    setServerError(null);
    setSuccessMessage(null);
    try {
      await resetPasswordApi({ token, password: data.password }).unwrap();
      const message = "Mật khẩu của bạn đã được thay đổi thành công!";
      setSuccessMessage(message);
      addToast({
        type: "success",
        title: "Đổi mật khẩu thành công",
        message,
      });
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      const message = err?.data?.message || "Thay đổi mật khẩu thất bại. Đường dẫn có thể đã hết hạn.";
      setServerError(message);
      addToast({
        type: "error",
        title: "Đổi mật khẩu thất bại",
        message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row-reverse bg-zinc-50 font-google-sans selection:bg-rose-500 selection:text-white">
      {/* Right Action Zone (35%) - Form Area */}
      <div className="w-full lg:w-[35%] flex flex-col justify-between p-8 lg:p-12 border-l-2 border-zinc-900/5 bg-white relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
        
        <div>
          <Link href="/login" className="inline-flex items-center text-sm font-google-sans-bold uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về Đăng nhập
          </Link>
        </div>

        <div className="mt-16 mb-auto animate-fade-in text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-google-sans-bold tracking-tighter text-zinc-900 mb-2">
            Tạo Lại<br />
            <span className="gradient-text-warm">Mật Khẩu.</span>
          </h1>
          <p className="text-zinc-500 mt-4 mb-10 text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
            Hãy thiết lập mật khẩu bảo mật mới cho tài khoản của bạn.
          </p>

          {!token ? (
              <div className="p-6 bg-rose-50 rounded-xl border border-rose-200 text-center space-y-4 max-w-sm mx-auto lg:mx-0">
                  <p className="text-sm text-rose-700 font-google-sans-medium">
                      Đường dẫn không hợp lệ. Không tìm thấy mã bảo mật trong địa chỉ URL.
                  </p>
                  <Link href="/forgot-password" className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-full font-google-sans-bold hover:bg-rose-600 transition-colors w-full">
                      Xin cấp lại mật khẩu
                  </Link>
              </div>
          ) : successMessage ? (
              <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center space-y-4 max-w-sm mx-auto lg:mx-0">
                  <p className="text-sm text-green-700 font-google-sans-medium">
                      {successMessage}
                  </p>
                  <p className="text-xs text-zinc-500">Đang tự động chuyển về trang Đăng nhập...</p>
              </div>
          ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-sm mx-auto lg:mx-0 text-left">
                  <div className="space-y-1">
                      <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider block">
                          Mật Khẩu Mới
                      </label>
                      <input
                          {...register("password")}
                          type="password"
                          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
                          placeholder="••••••••"
                      />
                      {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1">
                      <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider block">
                          Xác Nhận Mật Khẩu
                      </label>
                      <input
                          {...register("confirmPassword")}
                          type="password"
                          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
                          placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  {serverError && (
                      <div className="p-3 bg-rose-50 text-rose-600 text-sm border-l-4 border-rose-600">
                          {serverError}
                      </div>
                  )}

                  <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-zinc-900 text-white py-4 font-google-sans-bold text-lg uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6 shadow-xl shadow-zinc-900/10 hover:shadow-rose-600/20"
                  >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {isLoading ? "Đang Cập Nhật..." : "Lưu Mật Khẩu Bới"}
                  </button>
              </form>
          )}
        </div>

        <div className="text-xs text-zinc-400 font-google-sans-medium tracking-wide mt-8 text-center lg:text-left">
          SCharity Platform © 2026
        </div>
      </div>

      {/* Left Visual Zone (65%) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/assets/login.png")' }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 w-full px-20 select-none pointer-events-none text-right">
          <h2 className="text-[12vw] leading-[0.85] font-google-sans-bold text-white tracking-tighter drop-shadow-2xl">
            SỨ<br />
            MỆNH<br />
            CHUNG.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex justify-center items-center bg-zinc-50">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
