"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logout } from "@/lib/store/features/auth/authSlice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const navLinks = [
    { href: "/campaigns", label: "Chiến Dịch" },
    { href: "/#how-it-works", label: "Cách Hoạt Động" },
    { href: "/#stats", label: "Tác Động" },
    { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Heart className="w-4 h-4 text-black fill-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">SCharity</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-rose-500 to-violet-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {user?.avatarUrl && (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName ?? ""}
                                            className="w-8 h-8 rounded-full border border-black/10"
                                        />
                                    )}
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.fullName}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-black/5 transition-colors text-gray-500 hover:text-gray-700"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="scale-90 origin-right">
                                <GoogleLoginButton />
                            </div>
                        )}
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
                <div className="md:hidden glass border-t border-black/5 px-4 py-4 flex flex-col gap-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                {user?.avatarUrl && (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName ?? ""}
                                        className="w-7 h-7 rounded-full"
                                    />
                                )}
                                <span className="text-sm text-gray-700">{user?.fullName}</span>
                            </div>
                            <button onClick={handleLogout} className="text-sm text-gray-500">
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center w-full">
                            <GoogleLoginButton />
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
