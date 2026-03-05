"use client";
import Link from "next/link";
import { Heart, ArrowUpRight, TrendingUp, Clock, Plus } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { StatCounter, RollingCounter } from "@/components/ui/number-counter";
import { BentoGrid } from "@/components/ui/bento-grid";

const recentDonations = [
    { campaign: "Phẫu Thuật Tim Cho Trẻ Em", amount: 500, date: "2 giờ trước", emoji: "❤️‍🩹" },
    { campaign: "Xây Trường Học Hà Giang", amount: 200, date: "1 ngày trước", emoji: "🏫" },
    { campaign: "Cứu Trợ Lũ Lụt", amount: 1000, date: "3 ngày trước", emoji: "🆘" },
    { campaign: "Học Bổng Sinh Viên", amount: 300, date: "1 tuần trước", emoji: "🎓" },
];

const myCampaigns = [
    { title: "Sữa Cho Bé Vùng Khó Khăn", raised: 65, goal: 150, donors: 430, daysLeft: 25, emoji: "🍼", progress: 43 },
    { title: "Máy Tính Cho Em", raised: 240, goal: 350, donors: 1680, daysLeft: 18, emoji: "💻", progress: 69 },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <p className="text-white/40 text-sm mb-1">Chào mừng trở lại 👋</p>
                        <h1 className="text-3xl md:text-4xl font-black text-white">
                            <HighlightText variant="underline" color="primary">Dashboard</HighlightText>
                        </h1>
                    </div>
                    <Magnetic intensity={0.3} range={60}>
                        <Link href="/campaigns/create">
                            <RainbowButton colors={["#f43f5e", "#8b5cf6", "#f43f5e"]} duration={2.5} borderWidth={1.5} className="text-sm">
                                <Plus className="w-4 h-4" />
                                Tạo Chiến Dịch
                            </RainbowButton>
                        </Link>
                    </Magnetic>
                </div>

                {/* Stats Bento */}
                <BentoGrid className="mb-10 lg:grid-cols-4">
                    {[
                        { label: "Tổng Quyên Góp", value: 2000, prefix: "₫", suffix: "k", icon: Heart, color: "from-rose-500/20" },
                        { label: "Chiến Dịch Hỗ Trợ", value: 4, suffix: "", icon: TrendingUp, color: "from-violet-500/20" },
                        { label: "Ngày Tham Gia", value: 127, suffix: "", icon: Clock, color: "from-blue-500/20" },
                        { label: "Tác Động (Người)", value: 89, suffix: "+", icon: ArrowUpRight, color: "from-emerald-500/20" },
                    ].map((stat) => (
                        <div key={stat.label} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${stat.color} to-transparent`}>
                            <stat.icon className="w-5 h-5 text-white/40 mb-3" />
                            <div className="text-3xl font-black text-white mb-1">
                                <RollingCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm text-white/50">{stat.label}</p>
                        </div>
                    ))}
                </BentoGrid>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Donations */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-white">Quyên Góp Gần Đây</h2>
                            <Link href="/campaigns" className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1">
                                Xem tất cả <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentDonations.map((d, i) => (
                                <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-xl shrink-0">
                                        {d.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{d.campaign}</p>
                                        <p className="text-xs text-white/40">{d.date}</p>
                                    </div>
                                    <div className="text-rose-400 font-bold text-sm shrink-0">
                                        +₫{d.amount}k
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Campaigns */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-white">Chiến Dịch Của Tôi</h2>
                            <Link href="/campaigns/create" className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1">
                                Tạo mới <Plus className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-5">
                            {myCampaigns.map((c, i) => (
                                <div key={i} className="glass rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{c.emoji}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{c.title}</p>
                                            <div className="flex gap-3 text-xs text-white/40 mt-0.5">
                                                <span>{c.donors} nhà HT</span>
                                                <span>{c.daysLeft} ngày còn lại</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400">{c.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-xs text-white/40">
                                        <span>
                                            <StatCounter value={c.raised} prefix="₫" suffix="tr" label="" className="inline text-white/70 text-xs" />
                                        </span>
                                        <span>Mục tiêu: ₫{c.goal}tr</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
