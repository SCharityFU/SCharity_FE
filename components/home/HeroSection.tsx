"use client";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { MorphingText } from "@/components/ui/text-morphing";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { useGetActiveUserCountQuery } from "@/lib/store/features/home/homeApi";
import { NumberCounter } from "@/components/ui/number-counter";

export function HeroSection() {
  const { data: userCount = 50000, isLoading } = useGetActiveUserCountQuery();

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-pattern pt-16 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-black/10 text-sm text-black/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p>
            Hơn <NumberCounter value={userCount} /> nhà hảo tâm đã tin tưởng
          </p>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6">
          <span className="block text-black">Cùng nhau</span>
          <span className="block gradient-text">
            <MorphingText
              words={["Thay Đổi", "Yêu Thương", "Hy Vọng", "Trao Tặng", "Kết Nối"]}
              interval={2500}
              className="gradient-text"
            />
          </span>
          <span className="block text-black/80 text-4xl md:text-5xl lg:text-6xl mt-2">
            cuộc sống
          </span>
        </h1>

        <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          SCharity là nền tảng gây quỹ từ thiện{" "}
          <HighlightText variant="marker" color="accent" className="text-black/80">
            minh bạch & uy tín
          </HighlightText>{" "}
          tại Việt Nam. Kết nối tấm lòng hảo tâm với những hoàn cảnh cần giúp đỡ.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Magnetic intensity={0.4} range={80}>
            <Link href="/campaigns">
              <RainbowButton
                colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#22c55e", "#f43f5e"]}
                duration={2.5}
                borderWidth={2}
                className="text-base px-2"
              >
                Khám Phá Chiến Dịch
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </RainbowButton>
            </Link>
          </Magnetic>
          <Magnetic intensity={0.3} range={60}>
            <Link
              href="/campaigns/create"
              className="px-8 py-3 rounded-lg glass border border-black/20 text-black font-medium hover:bg-black/10 transition-colors flex items-center gap-2"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              Tạo Chiến Dịch
            </Link>
          </Magnetic>
        </div>

        {/* Social proof row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-black/40">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["🧑", "👩", "👨", "🧕"].map((e, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full glass border border-black/20 flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <span>
              <NumberCounter value={userCount} prefix="+" /> nhà hảo tâm
            </span>
          </div>
          <div>
            ⭐️ <NumberCounter value={4.9} />
            /5 đánh giá
          </div>
          <div>🔒 Thanh toán bảo mật</div>
        </div>
      </div>
    </section>
  );
}
