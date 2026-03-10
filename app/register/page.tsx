import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-50 font-google-sans selection:bg-rose-500 selection:text-white">

      {/* Left Action Zone (35%) - Form Area */}
      <div className="w-full lg:w-[35%] flex flex-col justify-between p-8 lg:p-12 border-r-2 border-zinc-900/5 bg-white relative z-10 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-google-sans-bold uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trang Chủ
          </Link>
        </div>

        <div className="mt-16 mb-auto animate-fade-in text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-google-sans-bold tracking-tighter text-zinc-900 mb-2">
            Gia nhập<br />
            <span className="gradient-text-warm">Cộng Đồng.</span>
          </h1>
          <p className="text-zinc-500 mt-4 mb-10 text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
            Tạo tài khoản SCharity ngay hôm nay. Mỗi sự đóng góp đều tạo ra thay đổi lớn lao.
          </p>

          <div className="max-w-sm mx-auto lg:mx-0">
            <RegisterForm />
          </div>

          <div className="mt-8 text-sm text-zinc-500 text-center lg:text-left">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-google-sans-bold text-zinc-900 hover:text-rose-600 underline underline-offset-4 decoration-2">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-google-sans-medium tracking-wide mt-8 text-center lg:text-left">
          SCharity Platform © 2026
        </div>
      </div>

      {/* Right Visual Zone (65%) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        {/* Background Image complementing login image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/assets/register.png")' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Typographic Element */}
        <div className="relative z-10 w-full px-20 select-none pointer-events-none text-left">
          <h2 className="text-[10vw] leading-[0.9] font-google-sans-bold text-white tracking-tighter drop-shadow-2xl">
            SỰ<br />
            THAY ĐỔI.
          </h2>
        </div>
      </div>
    </div>
  );
}
