"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterMutation } from "@/lib/store/features/auth/authApi";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ và tên ít nhất 2 ký tự").max(100),
  email: z.string().email("Định dạng email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, và một số"
    ),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const response = await registerApi({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap();
      
      if (response.success) {
        setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.");
        // Optional: clear form or redirect after a delay
      }
    } catch (err: any) {
      setServerError(err?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
      {successMessage ? (
        <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center space-y-4">
            <h3 className="text-xl font-google-sans-bold text-green-700">Thành công! 🎉</h3>
            <p className="text-sm text-green-600 font-google-sans-medium">
                {successMessage}
            </p>
            <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-google-sans-bold transition-colors"
            >
                Đi đến trang Đăng Nhập
            </button>
        </div>
      ) : (
        <>
          <div className="space-y-1">
        <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider">
          Họ và Tên
        </label>
        <input
          {...register("fullName")}
          type="text"
          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
          placeholder="Nhập họ và tên..."
        />
        {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
          placeholder="email@example.com"
        />
        {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider">
          Mật khẩu
        </label>
        <input
          {...register("password")}
          type="password"
          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
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
        {isLoading ? "Đang xử lý..." : "Tham Gia Ngay"}
      </button>
      </>
      )}
    </form>
  );
}
