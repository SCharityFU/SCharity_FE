'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-50/50 font-google-sans p-4 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background large 404 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-[45%] -translate-y-1/2 text-[35vw] font-black text-rose-900/5 select-none pointer-events-none z-0 tracking-tighter">
        404
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* User can place their illustration here */}
        <div className="w-full max-w-sm -mb-8 relative flex justify-center z-10">
          <img
            src="/assets/404 Error Page.webp"
            alt="Illustration"
            className="w-[80%] md:w-[90%] h-auto object-contain drop-shadow-sm"
            onError={(e) => {
              // Fallback to hide if the user hasn't put the image in public/assets yet
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML =
                  '<div class="w-full h-full flex flex-col items-center justify-center text-rose-200 border-2 border-dashed border-rose-200 rounded-2xl"><span class="text-xs">/public/assets/<br/>404 Error Page.webp</span></div>';
              }
            }}
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-google-sans-bold text-zinc-900 mb-4 tracking-tight">
          Không tìm thấy trang
        </h1>

        <p className="text-zinc-500 mb-10 text-base md:text-lg leading-relaxed max-w-md font-google-sans-medium">
          Trang bạn đang cố truy cập không tồn tại hoặc đã bị di dời. Hãy cùng đưa bạn trở lại đúng vị trí nhé.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-zinc-200 text-zinc-600 font-google-sans-bold hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay Lại
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-rose-500 text-white font-google-sans-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
