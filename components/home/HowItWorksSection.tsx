"use client";
import { useRef } from "react";
import { AnimatedBeam, BeamContainer, BeamNode } from "@/components/ui/animated-beam";
import { HighlightText } from "@/components/ui/highlight-text";

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const donorRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);

  const steps = [
    { icon: "👤", label: "Nhà Hảo Tâm", sub: "Bạn quyên góp" },
    { icon: "💻", label: "SCharity", sub: "Xử lý & xác thực" },
    { icon: "📋", label: "Chiến Dịch", sub: "Nhận quỹ" },
    { icon: "🌟", label: "Tác Động", sub: "Thay đổi cuộc sống" },
  ];
  const refs = [donorRef, platformRef, campaignRef, impactRef];

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Cách{" "}
            <HighlightText variant="circle" color="secondary" className="text-black">
              Hoạt Động
            </HighlightText>
          </h2>
          <p className="text-black/50 max-w-xl mx-auto">
            Quy trình đơn giản, minh bạch và an toàn. Từ ý định thiện nguyện đến tác động thực tế.
          </p>
        </div>

        <BeamContainer
          ref={containerRef}
          className="flex items-center justify-center gap-4 md:gap-12 flex-wrap md:flex-nowrap py-12"
        >
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <BeamNode
                ref={refs[i]}
                className="w-20 h-20 rounded-2xl glass-card border-black/20 flex-col gap-1"
              >
                <span className="text-3xl">{step.icon}</span>
              </BeamNode>
              <div className="text-center">
                <p className="text-sm font-semibold text-black">{step.label}</p>
                <p className="text-xs text-black/40">{step.sub}</p>
              </div>
            </div>
          ))}

          {/* Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={donorRef}
            toRef={platformRef}
            gradientStartColor="#f43f5e"
            gradientStopColor="#8b5cf6"
            duration={2}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={platformRef}
            toRef={campaignRef}
            gradientStartColor="#8b5cf6"
            gradientStopColor="#3b82f6"
            duration={2}
            delay={0.5}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={campaignRef}
            toRef={impactRef}
            gradientStartColor="#3b82f6"
            gradientStopColor="#22c55e"
            duration={2}
            delay={1}
          />
        </BeamContainer>

        {/* Steps description */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {[
            {
              n: "01",
              title: "Chọn Chiến Dịch",
              desc: "Duyệt hàng trăm chiến dịch ý nghĩa theo danh mục bạn quan tâm.",
            },
            {
              n: "02",
              title: "Quyên Góp",
              desc: "Thanh toán an toàn với mọi phương thức phổ biến tại Việt Nam.",
            },
            {
              n: "03",
              title: "Theo Dõi",
              desc: "Nhận cập nhật thường xuyên về tiến độ chiến dịch bạn hỗ trợ.",
            },
            {
              n: "04",
              title: "Tạo Tác Động",
              desc: "Chứng kiến cuộc sống thay đổi nhờ sự đóng góp của bạn.",
            },
          ].map((s) => (
            <div key={s.n} className="glass-card rounded-xl p-5">
              <div className="text-3xl font-black gradient-text mb-3">{s.n}</div>
              <h3 className="font-semibold text-black mb-2">{s.title}</h3>
              <p className="text-sm text-black/50">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
