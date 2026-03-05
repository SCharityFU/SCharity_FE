"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Shield, Zap, Globe, BarChart3, Users } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { MorphingText } from "@/components/ui/text-morphing";
import { StatCounter } from "@/components/ui/number-counter";
import { BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedBeam, BeamContainer, BeamNode } from "@/components/ui/animated-beam";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { CampaignCard, type Campaign } from "@/components/CampaignCard";

/* ─── Mock Data ─── */
const campaigns: Campaign[] = [
    {
        id: "1", title: "Xây Trường Học Vùng Cao Hà Giang",
        description: "Giúp 300 trẻ em dân tộc thiểu số có nơi học tập an toàn và khang trang.",
        category: "Giáo Dục", raised: 180, goal: 300, donors: 1240, daysLeft: 15,
        imageGradient: "bg-gradient-to-br from-blue-600 to-indigo-800", emoji: "🏫", highlight: "underline",
    },
    {
        id: "2", title: "Phẫu Thuật Tim Miễn Phí Cho Trẻ Em",
        description: "Hỗ trợ 50 ca phẫu thuật tim bẩm sinh cho trẻ em nghèo trên cả nước.",
        category: "Y Tế", raised: 420, goal: 500, donors: 3890, daysLeft: 8,
        imageGradient: "bg-gradient-to-br from-rose-600 to-pink-800", emoji: "❤️‍🩹", highlight: "circle",
    },
    {
        id: "3", title: "Phủ Xanh 1000 Hecta Rừng Tây Nguyên",
        description: "Trồng cây phục hồi rừng đầu nguồn, bảo vệ hệ sinh thái và nguồn nước.",
        category: "Môi Trường", raised: 95, goal: 200, donors: 672, daysLeft: 30,
        imageGradient: "bg-gradient-to-br from-green-600 to-emerald-800", emoji: "🌳", highlight: "underline",
    },
    {
        id: "4", title: "Cứu Trợ Lũ Lụt Miền Trung",
        description: "Hỗ trợ khẩn cấp lương thực, nước sạch và vật dụng thiết yếu cho đồng bào.",
        category: "Cứu Trợ", raised: 750, goal: 800, donors: 8920, daysLeft: 3,
        imageGradient: "bg-gradient-to-br from-amber-500 to-orange-700", emoji: "🆘", highlight: "marker",
    },
    {
        id: "5", title: "Học Bổng Sinh Viên Nghèo Vượt Khó",
        description: "Trao 200 suất học bổng cho sinh viên xuất sắc có hoàn cảnh khó khăn.",
        category: "Giáo Dục", raised: 130, goal: 250, donors: 945, daysLeft: 20,
        imageGradient: "bg-gradient-to-br from-violet-600 to-purple-800", emoji: "🎓", highlight: "underline",
    },
    {
        id: "6", title: "Nhà Tình Thương Cho Người Vô Gia Cư",
        description: "Xây dựng 20 căn nhà ấm áp cho những mảnh đời bất hạnh tại TP.HCM.",
        category: "Xã Hội", raised: 310, goal: 400, donors: 2150, daysLeft: 12,
        imageGradient: "bg-gradient-to-br from-teal-600 to-cyan-800", emoji: "🏠", highlight: "circle",
    },
];

const bentoFeatures = [
    {
        icon: Shield,
        title: "Minh Bạch 100%",
        description: "Mọi giao dịch được ghi nhận và công khai. Bạn biết rõ tiền đi đâu.",
        className: "md:col-span-2",
        gradient: "from-rose-500/20 to-pink-500/10",
    },
    {
        icon: Zap,
        title: "Thanh Toán Tức Thì",
        description: "Chuyển tiền ngay lập tức qua VNPay, Momo, ZaloPay và thẻ ngân hàng.",
        className: "",
        gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
        icon: Globe,
        title: "Phủ Sóng Toàn Quốc",
        description: "Kết nối các chiến dịch từ 63 tỉnh thành trên cả Việt Nam.",
        className: "",
        gradient: "from-blue-500/20 to-indigo-500/10",
    },
    {
        icon: BarChart3,
        title: "Phân Tích Thời Gian Thực",
        description: "Dashboard chi tiết giúp nhà sáng lập theo dõi tiến độ và báo cáo minh bạch.",
        className: "",
        gradient: "from-violet-500/20 to-purple-500/10",
    },
    {
        icon: Users,
        title: "Cộng Đồng Mạnh Mẽ",
        description: "Hơn 50,000 nhà hảo tâm đang cùng nhau tạo nên những điều kỳ diệu.",
        className: "md:col-span-2",
        gradient: "from-emerald-500/20 to-teal-500/10",
    },
];

/* ─── How It Works beam data ─── */
function HowItWorksSection() {
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
                        <HighlightText variant="circle" color="secondary" className="text-white">
                            Hoạt Động
                        </HighlightText>
                    </h2>
                    <p className="text-white/50 max-w-xl mx-auto">
                        Quy trình đơn giản, minh bạch và an toàn. Từ ý định thiện nguyện đến tác động thực tế.
                    </p>
                </div>

                <BeamContainer ref={containerRef} className="flex items-center justify-center gap-4 md:gap-12 flex-wrap md:flex-nowrap py-12">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <BeamNode
                                ref={refs[i]}
                                className="w-20 h-20 rounded-2xl glass-card border-white/20 flex-col gap-1"
                            >
                                <span className="text-3xl">{step.icon}</span>
                            </BeamNode>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-white">{step.label}</p>
                                <p className="text-xs text-white/40">{step.sub}</p>
                            </div>
                        </div>
                    ))}

                    {/* Beams */}
                    <AnimatedBeam containerRef={containerRef} fromRef={donorRef} toRef={platformRef}
                        gradientStartColor="#f43f5e" gradientStopColor="#8b5cf6" duration={2} />
                    <AnimatedBeam containerRef={containerRef} fromRef={platformRef} toRef={campaignRef}
                        gradientStartColor="#8b5cf6" gradientStopColor="#3b82f6" duration={2} delay={0.5} />
                    <AnimatedBeam containerRef={containerRef} fromRef={campaignRef} toRef={impactRef}
                        gradientStartColor="#3b82f6" gradientStopColor="#22c55e" duration={2} delay={1} />
                </BeamContainer>

                {/* Steps description */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    {[
                        { n: "01", title: "Chọn Chiến Dịch", desc: "Duyệt hàng trăm chiến dịch ý nghĩa theo danh mục bạn quan tâm." },
                        { n: "02", title: "Quyên Góp", desc: "Thanh toán an toàn với mọi phương thức phổ biến tại Việt Nam." },
                        { n: "03", title: "Theo Dõi", desc: "Nhận cập nhật thường xuyên về tiến độ chiến dịch bạn hỗ trợ." },
                        { n: "04", title: "Tạo Tác Động", desc: "Chứng kiến cuộc sống thay đổi nhờ sự đóng góp của bạn." },
                    ].map((s) => (
                        <div key={s.n} className="glass-card rounded-xl p-5">
                            <div className="text-3xl font-black gradient-text mb-3">{s.n}</div>
                            <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                            <p className="text-sm text-white/50">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Main Page ─── */
export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-pattern pt-16 overflow-hidden">
                {/* Decorative orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-sm text-white/70 mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Hơn 50,000 nhà hảo tâm đã tin tưởng
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6">
                        <span className="block text-white">Cùng nhau</span>
                        <span className="block gradient-text">
                            <MorphingText
                                words={["Thay Đổi", "Yêu Thương", "Hy Vọng", "Trao Tặng", "Kết Nối"]}
                                interval={2500}
                                className="gradient-text"
                            />
                        </span>
                        <span className="block text-white/80 text-4xl md:text-5xl lg:text-6xl mt-2">cuộc sống</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        SCharity là nền tảng gây quỹ từ thiện{" "}
                        <HighlightText variant="marker" color="accent" className="text-white/80">
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
                                className="px-8 py-3 rounded-lg glass border border-white/20 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <Heart className="w-5 h-5 text-rose-400" />
                                Tạo Chiến Dịch
                            </Link>
                        </Magnetic>
                    </div>

                    {/* Social proof row */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {["🧑", "👩", "👨", "🧕"].map((e, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center text-sm">
                                        {e}
                                    </div>
                                ))}
                            </div>
                            <span>+50K nhà hảo tâm</span>
                        </div>
                        <div>⭐️ 4.9/5 đánh giá</div>
                        <div>🔒 Thanh toán bảo mật</div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section id="stats" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Tác Động{" "}
                            <HighlightText variant="underline" color="primary" className="text-white">
                                Thực Tế
                            </HighlightText>
                        </h2>
                        <p className="text-white/50">Những con số nói lên tất cả</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 1250, suffix: "+", label: "Chiến Dịch Thành Công" },
                            { value: 52000, suffix: "+", label: "Nhà Hảo Tâm" },
                            { value: 18, suffix: " tỷ ₫", label: "Đã Gây Quỹ" },
                            { value: 63, suffix: " tỉnh", label: "Phủ Sóng Toàn Quốc" },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform">
                                <StatCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    label={stat.label}
                                    className="text-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Bento ── */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Tại Sao Chọn{" "}
                            <HighlightText variant="circle" color="secondary" className="gradient-text">
                                SCharity?
                            </HighlightText>
                        </h2>
                        <p className="text-white/50 max-w-xl mx-auto">
                            Chúng tôi xây dựng nền tảng với sứ mệnh tối cao: mỗi đồng quyên góp đều tạo ra tác động thực sự.
                        </p>
                    </div>
                    <BentoGrid>
                        {bentoFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className={`glass-card rounded-2xl p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${feature.gradient} ${feature.className}`}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </BentoGrid>
                </div>
            </section>

            {/* ── How It Works ── */}
            <HowItWorksSection />

            {/* ── Featured Campaigns ── */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-3">
                                Chiến Dịch{" "}
                                <HighlightText variant="underline" color="accent" className="text-white">
                                    Nổi Bật
                                </HighlightText>
                            </h2>
                            <p className="text-white/50">Những chiến dịch đang cần sự hỗ trợ của bạn</p>
                        </div>
                        <Link
                            href="/campaigns"
                            className="hidden md:flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors"
                        >
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Magnetic intensity={0.3} range={60}>
                            <Link href="/campaigns">
                                <RainbowButton colors={["#f43f5e", "#8b5cf6", "#22c55e", "#f43f5e"]} duration={3} borderWidth={2}>
                                    Xem Tất Cả Chiến Dịch
                                    <ArrowRight className="w-4 h-4" />
                                </RainbowButton>
                            </Link>
                        </Magnetic>
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-violet-500/10 to-blue-500/10" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <div className="text-5xl mb-6">❤️</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Bắt đầu hành trình{" "}
                                <HighlightText variant="marker" color="primary" className="text-white">
                                    thiện nguyện
                                </HighlightText>{" "}
                                ngay hôm nay
                            </h2>
                            <p className="text-white/60 mb-8 max-w-xl mx-auto">
                                Dù bạn muốn quyên góp hay tạo chiến dịch gây quỹ, SCharity sẵn sàng đồng hành cùng bạn.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Magnetic intensity={0.4} range={80}>
                                    <Link href="/campaigns">
                                        <RainbowButton colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]} duration={2} borderWidth={2} className="text-base">
                                            Quyên Góp Ngay
                                            <Heart className="w-4 h-4 fill-current" />
                                        </RainbowButton>
                                    </Link>
                                </Magnetic>
                                <Magnetic intensity={0.3} range={60}>
                                    <Link href="/auth/login" className="px-8 py-3 rounded-lg glass border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
                                        Tạo Tài Khoản Miễn Phí
                                    </Link>
                                </Magnetic>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
