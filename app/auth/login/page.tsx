"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, Lock, User, ArrowRight } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { VercelTabs } from "@/components/ui/vercel-tabs";

function LoginForm() {
    return (
        <div className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="email" placeholder="Email của bạn" className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/50 transition-colors text-sm" />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="password" placeholder="Mật khẩu" className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/50 transition-colors text-sm" />
            </div>
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Ghi nhớ đăng nhập
                </label>
                <Link href="/auth/forgot-password" className="text-rose-400 hover:text-rose-300 transition-colors">
                    Quên mật khẩu?
                </Link>
            </div>
            <Magnetic intensity={0.3} range={60}>
                <RainbowButton colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]} duration={2} borderWidth={2} className="w-full text-sm">
                    Đăng Nhập
                    <ArrowRight className="w-4 h-4" />
                </RainbowButton>
            </Magnetic>
            <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">hoặc</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>
            <button className="w-full py-2.5 rounded-xl glass border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <span>🇬</span> Đăng nhập với Google
            </button>
        </div>
    );
}

function RegisterForm() {
    return (
        <div className="space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="text" placeholder="Họ và tên" className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/50 transition-colors text-sm" />
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="email" placeholder="Email của bạn" className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/50 transition-colors text-sm" />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/50 transition-colors text-sm" />
            </div>
            <p className="text-xs text-white/30">
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <Link href="/terms" className="text-rose-400 hover:underline">Điều khoản dịch vụ</Link> và{" "}
                <Link href="/privacy" className="text-rose-400 hover:underline">Chính sách bảo mật</Link>.
            </p>
            <Magnetic intensity={0.3} range={60}>
                <RainbowButton colors={["#f43f5e", "#8b5cf6", "#22c55e", "#f43f5e"]} duration={2} borderWidth={2} className="w-full text-sm">
                    Tạo Tài Khoản
                    <Heart className="w-4 h-4 fill-current" />
                </RainbowButton>
            </Magnetic>
            <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">hoặc</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>
            <button className="w-full py-2.5 rounded-xl glass border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <span>🇬</span> Đăng ký với Google
            </button>
        </div>
    );
}

export default function LoginPage() {
    const tabs = [
        { label: "Đăng Nhập", value: "login", content: <LoginForm /> },
        { label: "Đăng Ký", value: "register", content: <RegisterForm /> },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 hero-gradient grid-pattern">
            {/* Decorative orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="font-bold text-xl gradient-text">SCharity</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        Chào mừng{" "}
                        <HighlightText variant="underline" color="primary" className="text-white">
                            trở lại
                        </HighlightText>
                    </h1>
                    <p className="text-sm text-white/40">Cùng nhau tạo nên sự thay đổi</p>
                </div>

                {/* Auth Card */}
                <div className="glass-card rounded-3xl p-8">
                    <VercelTabs tabs={tabs} defaultTab="login" />
                </div>
            </div>
        </div>
    );
}
