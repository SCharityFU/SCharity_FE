'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '@/lib/store/features/auth/authApi';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getSafeApiErrorMessage } from '@/lib/api-error';

const loginSchema = z.object({
  email: z.string().email('Định dạng email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginApi, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await loginApi({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (response.success) {
        const redirectTo = searchParams.get('redirect') || '/campaigns';
        toast.success('Đăng nhập thành công');
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const message = getSafeApiErrorMessage(err, 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
      <div className="space-y-1">
        <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
          placeholder="email@example.com"
        />
        {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <label className="text-sm font-google-sans-bold text-zinc-800 uppercase tracking-wider">Mật khẩu</label>
          <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-rose-600 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>
        <input
          {...register('password')}
          type="password"
          className="w-full bg-transparent border-b-2 border-zinc-300 py-2 text-lg text-zinc-900 focus:outline-none focus:border-rose-600 transition-colors placeholder:text-zinc-400"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {serverError && (
        <div className="p-3 bg-rose-50 text-rose-600 text-sm border-l-4 border-rose-600">{serverError}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-zinc-900 text-white py-4 font-google-sans-bold text-lg uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-xl shadow-zinc-900/10 hover:shadow-rose-600/20"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
      </button>
    </form>
  );
}
