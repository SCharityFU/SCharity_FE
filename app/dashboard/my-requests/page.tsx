"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    Landmark,
    Eye,
} from "lucide-react";
import { CampaignRequestStatus } from "@/dtos/enums";
import type { CampaignRequestResponseDto } from "@/dtos/campaign";
import { HighlightText } from "@/components/ui/highlight-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useGetMyRequestsQuery } from "@/lib/store/features/campaign/campaignApi";

const STATUS_CONFIG: Record<CampaignRequestStatus, { label: string; color: string; icon: typeof Clock }> = {
    [CampaignRequestStatus.PENDING]: { label: "Đang chờ", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
    [CampaignRequestStatus.APPROVED]: { label: "Đã duyệt", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    [CampaignRequestStatus.REJECTED]: { label: "Từ chối", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle },
};

function formatDateVN(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatVND(value: number): string {
    return value.toLocaleString("vi-VN") + " ₫";
}

export default function MyRequestsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isFetching } = useGetMyRequestsQuery({ page, limit });

    const requests = data?.data ?? [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages ?? 1;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-1 text-sm text-black/40 hover:text-black/70 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-black">
                            <HighlightText variant="underline" color="primary">
                                Yêu Cầu Tạo Chiến Dịch
                            </HighlightText>
                        </h1>
                        <p className="text-black/50 text-sm mt-2">
                            Danh sách các yêu cầu tạo chiến dịch bạn đã gửi
                        </p>
                    </div>
                    <Magnetic intensity={0.3} range={60}>
                        <Link href="/campaigns/create">
                            <RainbowButton
                                colors={["#f43f5e", "#8b5cf6", "#f43f5e"]}
                                duration={2.5}
                                borderWidth={1.5}
                                className="text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Mới
                            </RainbowButton>
                        </Link>
                    </Magnetic>
                </div>

                {/* Content */}
                {isLoading && (
                    <div className="space-y-4">
                        {["s1", "s2", "s3"].map((key) => (
                            <div key={key} className="glass-card rounded-2xl p-6 animate-pulse">
                                <div className="h-5 bg-black/10 rounded w-1/3 mb-3" />
                                <div className="h-4 bg-black/10 rounded w-1/2 mb-2" />
                                <div className="h-4 bg-black/10 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && requests.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <FileText className="w-12 h-12 text-black/20 mx-auto mb-4" />
                        <p className="text-black/50 text-lg mb-2">Chưa có yêu cầu nào</p>
                        <p className="text-black/30 text-sm mb-6">
                            Hãy tạo chiến dịch gây quỹ đầu tiên của bạn
                        </p>
                        <Link href="/campaigns/create">
                            <Button>
                                <Plus className="w-4 h-4" />
                                Tạo Chiến Dịch
                            </Button>
                        </Link>
                    </div>
                )}

                {!isLoading && requests.length > 0 && (
                    <>
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {requests.map((req: CampaignRequestResponseDto, i: number) => {
                                    const statusCfg = STATUS_CONFIG[req.status as CampaignRequestStatus];
                                    const StatusIcon = statusCfg.icon;
                                    return (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-black text-lg truncate">
                                                            {req.title}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}
                                                        >
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusCfg.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-black/50">
                                                        <span>Mục tiêu: {formatVND(req.goalAmount)}</span>
                                                        <span>Hạn: {formatDateVN(req.deadline)}</span>
                                                        <span>Gửi: {formatDateVN(req.createdAt)}</span>
                                                    </div>
                                                    {req.rejectReason && (
                                                        <div className="mt-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                                            <p className="text-sm text-rose-500">
                                                                <strong>Lý do từ chối:</strong> {req.rejectReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {req.bankInfo && (
                                                        <div className="mt-3 flex items-center gap-2 text-sm text-black/40">
                                                            <Landmark className="w-4 h-4" />
                                                            <span>
                                                                {req.bankInfo.bankName} — **** {req.bankInfo.accountNumber.slice(-4)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    {req.status === CampaignRequestStatus.PENDING && (
                                                        <Link href={`/dashboard/my-requests/${req.id}/bank-info`}>
                                                            <Button variant="outline" size="sm">
                                                                <Landmark className="w-3.5 h-3.5" />
                                                                Sửa Bank
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {req.campaignId && (
                                                        <Link href={`/campaigns/${req.campaignId}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                Xem CD
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1 || isFetching}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-black/50">
                                    Trang {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages || isFetching}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
