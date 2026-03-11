import Link from "next/link";
import { Heart } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";

export function CTABanner() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-violet-500/10 to-blue-500/10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="text-5xl mb-6">❤️</div>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Bắt đầu hành trình{" "}
              <HighlightText variant="marker" color="primary" className="text-black">
                thiện nguyện
              </HighlightText>{" "}
              ngay hôm nay
            </h2>
            <p className="text-black/60 mb-8 max-w-xl mx-auto">
              Dù bạn muốn quyên góp hay tạo chiến dịch gây quỹ, SCharity sẵn sàng đồng hành cùng
              bạn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic intensity={0.4} range={80}>
                <Link href="/campaigns">
                  <RainbowButton
                    colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                    duration={2}
                    borderWidth={2}
                    className="text-base"
                  >
                    Quyên Góp Ngay
                    <Heart className="w-4 h-4 fill-current" />
                  </RainbowButton>
                </Link>
              </Magnetic>
              <Magnetic intensity={0.3} range={60}>
                <Link
                  href="/auth/login"
                  className="px-8 py-3 rounded-lg glass border border-black/20 text-black font-medium hover:bg-black/10 transition-colors"
                >
                  Tạo Tài Khoản Miễn Phí
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
