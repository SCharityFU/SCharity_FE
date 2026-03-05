"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { RainbowButton } from "@/components/ui/rainbow-button";

const navLinks = [
    { href: "/campaigns", label: "Chiến Dịch" },
    { href: "/#how-it-works", label: "Cách Hoạt Động" },
    { href: "/#stats", label: "Tác Động" },
    { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Persist theme across refreshes
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/5 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">SCharity</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-rose-500 to-violet-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <AnimatedThemeToggle isDark={isDark} onToggle={toggleTheme} />
                        <Link href="/auth/login">
                            <RainbowButton
                                colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                                duration={3}
                                borderWidth={1.5}
                                className="text-xs"
                            >
                                Đăng Nhập
                            </RainbowButton>
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg glass"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden glass border-t border-black/5 dark:border-white/10 px-4 py-4 flex flex-col gap-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white py-2 transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-3 pt-2">
                        <AnimatedThemeToggle isDark={isDark} onToggle={toggleTheme} />
                        <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1">
                            <RainbowButton colors={["#f43f5e", "#8b5cf6", "#f43f5e"]} duration={3} borderWidth={1.5} className="w-full text-xs">
                                Đăng Nhập
                            </RainbowButton>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
