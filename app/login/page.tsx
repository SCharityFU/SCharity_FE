import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row-reverse bg-zinc-50 font-google-sans selection:bg-rose-500 selection:text-white">
      {/* Right Action Zone (35%) - Form Area */}
      <div className="w-full lg:w-[35%] lg:overflow-hidden flex flex-col justify-between p-8 lg:p-10 border-l-2 border-zinc-900/5 bg-white relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-google-sans-bold uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trang Chủ
          </Link>
        </div>

        <div className="mt-8 mb-auto animate-fade-in text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-google-sans-bold tracking-tighter text-zinc-900 mb-2">
            Đăng nhập
            <br />
            <span className="gradient-text-warm">Tài Khoản.</span>
          </h1>
          <p className="text-zinc-500 mt-2 mb-6 text-sm lg:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
            Chào mừng bạn trở lại với nền tảng FCam. Cùng nhau tạo nên những thay đổi tích cực!
          </p>

          <LoginForm />

          <div className="my-8 relative max-w-sm mx-auto lg:mx-0">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-google-sans-bold text-zinc-400">
              <span className="bg-white px-4">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="max-w-sm mx-auto lg:mx-0">
            <GoogleLoginButton fullWidth={true} />
          </div>

          <div className="mt-6 text-sm text-zinc-500 text-center lg:text-left">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-google-sans-bold text-zinc-900 hover:text-rose-600 underline underline-offset-4 decoration-2"
            >
              Khởi tạo ngay
            </Link>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-google-sans-medium tracking-wide mt-4 text-center lg:text-left">
          FCam Platform © 2026
        </div>
      </div>

      {/* Left Visual Zone (65%) - Image Background with large text */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        {/* Background Image user requested */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/assets/login.png")' }} />
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Typographic Element behind text (as user said "ở sau chữ" maybe meaning image is behind text) */}
        <div className="relative z-10 w-full px-20 select-none pointer-events-none text-right">
          <h2 className="text-[12vw] leading-[0.85] font-google-sans-bold text-white tracking-tighter drop-shadow-2xl">
            SỨ
            <br />
            MỆNH
            <br />
            CHUNG.
          </h2>
        </div>
      </div>
    </div>
  );
}
