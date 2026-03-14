"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPasswordMutation } from "@/lib/store/features/auth/authApi";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAnimatedToast } from "@/components/ui/animated-toast";
import { getSafeApiErrorMessage } from "@/lib/api-error";

const forgotPasswordSchema = z.object({
  email: z.string().email("Định dạng email không hợp lệ"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const { addToast } = useAnimatedToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await forgotPassword({ email: data.email }).unwrap();
      const message = "Nếu email này có trong hệ thống, chúng tôi đã gửi hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.";
      setSuccessMessage(message);
      addToast({
        type: "success",
        title: "Đã gửi yêu cầu",
        message,
      });
    } catch (err: unknown) {
      const message = getSafeApiErrorMessage(err, "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setServerError(message);
      addToast({
        type: "error",
        title: "Gửi yêu cầu thất bại",
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
            Trở lại đăng nhập
          </Link>
        </div>

        <div className="mt-16 mb-auto animate-fade-in text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-google-sans-bold tracking-tighter text-zinc-900 mb-2">
            Khôi phục<br />
            <span className="gradient-text-warm">Mật Khẩu.</span>
          </h1>
          <p className="text-zinc-500 mt-4 mb-10 text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
            Nhập địa chỉ email của bạn, chúng tôi sẽ gửi hướng dẫn khôi phục tài khoản.
          </p>

          {successMessage ? (
              <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center space-y-4 max-w-sm mx-auto lg:mx-0">
                  <p className="text-sm text-green-700 font-google-sans-medium">
                      {successMessage}
                  </p>
              </div>
          ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-sm mx-auto lg:mx-0">
                  <div className="space-y-1">
                      <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider text-left block">
                          Email Định Danh
                      </label>
                      <input
                          {...register("email")}
                          type="email"
                          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
                          placeholder="hello@example.com"
                      />
                      {errors.email && <p className="text-rose-500 text-xs mt-1 text-left">{errors.email.message}</p>}
                  </div>

                  {serverError && (
                      <div className="p-3 bg-rose-50 text-rose-600 text-sm border-l-4 border-rose-600 text-left">
                          {serverError}
                      </div>
                  )}

                  <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-zinc-900 text-white py-4 font-google-sans-bold text-lg uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6 shadow-xl shadow-zinc-900/10 hover:shadow-rose-600/20"
                  >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {isLoading ? "Đang Gửi..." : "Gửi Yêu Cầu"}
                  </button>
              </form>
          )}
        </div>

        <div className="text-xs text-zinc-400 font-google-sans-medium tracking-wide mt-8 text-center lg:text-left">
          SCharity Platform © 2026
        </div>
      </div>

      {/* Left Visual Zone (65%) - Image Background with large text */}
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
