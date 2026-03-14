"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderKanban, Users, Flag, Settings, HandCoins, ClipboardCheck } from "lucide-react";

const adminMenu = [
    { label: "Tổng quan", href: "/admin", icon: BarChart3 },
    { label: "Yêu cầu tạo campaign", href: "/admin/campaign-requests", icon: ClipboardCheck },
    { label: "Giao dịch", href: "/admin/transactions", icon: HandCoins },
    { label: "Chiến dịch", href: "/admin/campaigns", icon: FolderKanban },
    { label: "Người dùng", href: "/admin/users", icon: Users },
    { label: "Báo cáo", href: "/admin/reports", icon: Flag },
    { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string): boolean {
    if (href === "/admin") {
        return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-[calc(100vh-4rem)] pt-16">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[calc(100vh-4rem)]">
                <aside className="border-r border-black/10 bg-white/70 p-2 md:sticky md:top-16 md:h-[calc(100vh-4rem)] overflow-y-auto">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 px-2 mb-1.5">Quản lý hệ thống</p>
                    <nav className="space-y-0.5" aria-label="Thanh bên quản trị">
                        {adminMenu.map((item) => {
                            const active = isActivePath(pathname, item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${active
                                        ? "bg-rose-500 text-white"
                                        : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <section className="p-2 md:p-3 overflow-x-auto">
                    {children}
                </section>
            </div>
        </div>
    );
}
