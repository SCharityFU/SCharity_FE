"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, X, LogOut, LayoutDashboard, FileText, Megaphone, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logout } from "@/lib/store/features/auth/authSlice";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { LogIn } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/dtos";

const navLinks = [
    { href: "/campaigns", label: "Chiến Dịch" },
    { href: "/#how-it-works", label: "Cách Hoạt Động" },
    { href: "/#stats", label: "Tác Động" },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isAdmin = user?.role === UserRole.ADMIN;

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        router.push("/");
        router.refresh();
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-black/5 transition-colors outline-none">
                                        <img
                                            src={user?.avatarUrl || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
                                            alt={user?.fullName ?? ""}
                                            className="w-8 h-8 rounded-full border border-black/10 object-cover"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.fullName}
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        {user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <DropdownMenuItem onClick={() => router.push("/admin")}>
                                            <LayoutDashboard className="w-4 h-4 text-gray-400" />
                                            Quản trị
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/my-requests")}>
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Yêu Cầu Của Tôi
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/my-campaigns")}>
                                        <Megaphone className="w-4 h-4 text-gray-400" />
                                        Chiến Dịch Của Tôi
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:bg-rose-50">
                                        <LogOut className="w-4 h-4" />
                                        Đăng Xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="scale-90 origin-right">
                                <RainbowButton
                                    onClick={() => router.push('/login')}
                                    colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                                    duration={3}
                                    borderWidth={1.5}
                                    className="text-xs"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Đăng Nhập
                                </RainbowButton>
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
                        <>
                            <div className="flex items-center gap-2 pt-2 pb-1 border-t border-black/5">
                                <img
                                    src={user?.avatarUrl || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
                                    alt={user?.fullName ?? ""}
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
                            </div>
                            <Link
                                href="/dashboard"
                                className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                                onClick={() => setMobileOpen(false)}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Trang Quan Tri
                                </Link>
                            )}
                            <Link
                                href="/dashboard/my-requests"
                                className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                                onClick={() => setMobileOpen(false)}
                            >
                                <FileText className="w-4 h-4" /> Yêu Cầu Của Tôi
                            </Link>
                            <Link
                                href="/dashboard/my-campaigns"
                                className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Megaphone className="w-4 h-4" /> Chiến Dịch Của Tôi
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-rose-600 py-2 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Đăng Xuất
                            </button>
                        </>
                    ) : (
                        <div className="flex justify-center w-full">
                            <RainbowButton
                                onClick={() => router.push('/login')}
                                colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                                duration={3}
                                borderWidth={1.5}
                                className="w-full text-xs"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Đăng Nhập
                            </RainbowButton>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
