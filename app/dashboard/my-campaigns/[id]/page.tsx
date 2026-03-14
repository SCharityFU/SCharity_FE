"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Calendar,
    Edit2,
    BarChart3,
    Eye,
    Target,
    TrendingUp,
    Users,
    Zap,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { useGetMyCampaignsQuery, useGetCampaignUpdatesQuery, useDeleteCampaignUpdateMutation } from "@/lib/store/features/campaign/campaignApi";
import { UpdateModal, CampaignEditModal, UpdatesList, UpdateDetailModal } from "@/components/campaign/my-campaign";
import type { CampaignDto } from "@/dtos/campaign";
import { CampaignImageSlider } from "@/components/campaign/detail/CampaignImageSlider";
import { MyCampaignHeader } from "@/components/campaign/my-campaign/MyCampaignHeader";

function formatVND(value: number): string {
    return value.toLocaleString("vi-VN") + " ₫";
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────

function Bone({ className = "" }: { className?: string }) {
    return <div className={`rounded-xl bg-black/[0.06] animate-pulse ${className}`} />;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const campaignId = params.id as string;
    const [updateFilter, setUpdateFilter] = useState<"all" | "draft" | "published">("all");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCampaignEditOpen, setIsCampaignEditOpen] = useState(false);
    const [updateToEdit, setUpdateToEdit] = useState<any>(null);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [selectedUpdateForView, setSelectedUpdateForView] = useState<any>(null);

    const [deleteUpdate] = useDeleteCampaignUpdateMutation();

    // Fetch campaign from my campaigns list
    const { data: campaignsData, isLoading: isLoadingCampaign } = useGetMyCampaignsQuery({
        page: 1,
        limit: 100,
    });

    const campaign = campaignsData?.data?.find((c) => c.id === campaignId) as CampaignDto | undefined;

    // Map filter value to API status param
    const statusParam = updateFilter === "all" ? undefined : updateFilter;

    const { data: updatesData, isLoading: isLoadingUpdates } = useGetCampaignUpdatesQuery({
        campaignId,
        page: 1,
        limit: 20,
        status: statusParam,
    });

    const updates = updatesData?.data ?? [];

    const handleDeleteUpdate = async (updateId: string) => {
        try {
            await deleteUpdate({
                campaignId,
                updateId,
            }).unwrap();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete update:", error);
        }
    };

    const handleOpenCreateModal = () => {
        setUpdateToEdit(null);
        setIsUpdateModalOpen(true);
    };

    const handleOpenEditModal = (update: any) => {
        setUpdateToEdit(update);
        setIsUpdateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        setUpdateToEdit(null);
    };

    const handleViewDetail = (update: any) => {
        setSelectedUpdateForView(update);
        setIsViewDetailOpen(true);
    };

    if (isLoadingCampaign) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <Bone className="h-3 w-36 mb-7" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Thumbnail */}
                            <Bone className="aspect-video rounded-2xl" />

                            {/* Title area */}
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Bone className="h-5 w-24 rounded-full" />
                                    <Bone className="h-5 w-20 rounded-full" />
                                </div>
                                <Bone className="h-8 w-full" />
                                <Bone className="h-8 w-3/4" />
                            </div>

                            {/* Story */}
                            <Bone className="h-52 rounded-2xl" />

                            {/* Updates */}
                            <Bone className="h-48 rounded-2xl" />
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                            <Bone className="h-72 rounded-2xl" />
                            <Bone className="h-56 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-6 px-4">
                <div className="text-center">
                    <h2 className="text-xl font-black text-black mb-2">Chiến dịch không tìm thấy</h2>
                    <p className="text-sm text-black/45 mb-6 max-w-xs mx-auto">
                        Chiến dịch không tồn tại hoặc bạn không có quyền truy cập.
                    </p>
                </div>

                <Link
                    href="/dashboard/my-campaigns"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-black/5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
            </div>
        );
    }
const images = [campaign!.thumbnailUrl, ...(campaign!.mediaUrls ?? [])].filter(
    (u): u is string => !!u,
  );
    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
                <Link
                    href="/dashboard/my-campaigns"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black/70 transition-colors mb-7 group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    Chiến dịch của tôi
                </Link>

                {/* ── Main grid ──────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
                    {/* ── Left column ──────────────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <CampaignImageSlider images={images} />

                        {/* 2. Title + meta (compact header)
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h1 className="text-4xl md:text-5xl font-black text-black mb-3 leading-tight">
                                        {campaign.title}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-block px-3 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-xs font-bold text-rose-700">
                                            {campaign.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <Link href={`/campaigns/${campaign.id}`}>
                                        <Button variant="outline" size="sm" className="hover:bg-black/5">
                                            <Eye className="w-4 h-4" />
                                            Xem công khai
                                        </Button>
                                    </Link>
                                    <Button 
                                        onClick={() => setIsCampaignEditOpen(true)}
                                        size="sm"
                                        className="bg-black hover:bg-black/90"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Sửa chiến dịch
                                    </Button>
                                </div>
                            </div>
                        </motion.div> */}
                    <MyCampaignHeader campaign={campaign} setIsCampaignEditOpen={setIsCampaignEditOpen} />
                        {/* 3. Story Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-black/10 rounded-2xl p-8 hover:border-black/20 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-black mb-4">Câu chuyện</h3>
                            <RichTextContent 
                                content={campaign.story} 
                                className="text-base md:text-lg"
                                emptyText="Chưa có câu chuyện"
                            />
                        </motion.div>

                        {/* 4. Campaign Updates */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border border-black/10 rounded-2xl p-8 hover:border-black/20 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Cập nhật tiến độ
                                </h3>
                                <Button
                                    onClick={handleOpenCreateModal}
                                    size="sm"
                                    className="bg-black hover:bg-black/90"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Thêm cập nhật
                                </Button>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-1 mb-6 border-b">
                                {[
                                    { value: "all" as const, label: "Tất cả" },
                                    { value: "published" as const, label: "Đã công bố" },
                                    { value: "draft" as const, label: "Dự thảo" },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setUpdateFilter(tab.value)}
                                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                                            updateFilter === tab.value
                                                ? "border-black text-black"
                                                : "border-transparent text-black/50 hover:text-black/70"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Updates List Component */}
                            <UpdatesList
                                updates={updates}
                                isLoading={isLoadingUpdates}
                                updateFilter={updateFilter}
                                deleteConfirm={deleteConfirm}
                                setDeleteConfirm={setDeleteConfirm}
                                onEdit={handleOpenEditModal}
                                onDelete={handleDeleteUpdate}
                                onViewDetail={handleViewDetail}
                                formatDate={formatDate}
                            />
                        </motion.div>
                    </div>

                    {/* ── Right column (sticky sidebar) ─────────────────────────── */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white border border-black/10 rounded-2xl p-6 space-y-5 hover:border-black/20 transition-colors"
                        >
                            <h3 className="font-semibold text-black text-lg">Thông tin chiến dịch</h3>

                            {/* Key Stats Grid - 2 columns */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Mục tiêu */}
                                <motion.div
                                    whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(244, 63, 94, 0.15)" }}
                                    className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 border border-rose-200/50 hover:border-rose-300/75 transition-all duration-300 cursor-default"
                                >
                                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-rose-300/10 rounded-full blur-2xl" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-rose-700 tracking-wide">MỤC TIÊU</p>
                                            <Target className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <p className="font-black text-sm text-rose-700">{formatVND(campaign.goalAmount)}</p>
                                    </div>
                                </motion.div>

                                {/* Đã quyên góp */}
                                <motion.div
                                    whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(34, 197, 94, 0.15)" }}
                                    className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50 hover:border-emerald-300/75 transition-all duration-300 cursor-default"
                                >
                                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-300/10 rounded-full blur-2xl" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-emerald-700 tracking-wide">QUYÊN GÓP</p>
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="font-black text-sm text-emerald-700">{formatVND(campaign.raisedAmount)}</p>
                                    </div>
                                </motion.div>

                                {/* Nhà hảo tâm */}
                                <motion.div
                                    whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(59, 130, 246, 0.15)" }}
                                    className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50 hover:border-blue-300/75 transition-all duration-300 cursor-default"
                                >
                                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-300/10 rounded-full blur-2xl" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-blue-700 tracking-wide">NHÀ HẢO TÂM</p>
                                            <Users className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <p className="font-black text-sm text-blue-700">{campaign.donorCount || 0} người</p>
                                    </div>
                                </motion.div>

                                {/* Tiến độ */}
                                <motion.div
                                    whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(168, 85, 247, 0.15)" }}
                                    className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-4 border border-violet-200/50 hover:border-violet-300/75 transition-all duration-300 cursor-default"
                                >
                                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-violet-300/10 rounded-full blur-2xl" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-violet-700 tracking-wide">TIẾN ĐỘ</p>
                                            <Zap className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <p className="font-black text-lg text-violet-700">{(campaign.progressPercent ?? 0).toFixed(0)}%</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Còn cần quyên góp */}
                            {campaign.raisedAmount < campaign.goalAmount && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50 hover:border-amber-300/75 transition-all duration-300"
                                >
                                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-300/10 rounded-full blur-2xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-amber-700 tracking-wide mb-1">CÒN CẦN QUYÊN GÓP</p>
                                            <p className="font-black text-base text-amber-700">{formatVND(campaign.goalAmount - campaign.raisedAmount)}</p>
                                        </div>
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    </div>
                                </motion.div>
                            )}

                            {/* Progress Bar with animation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-5 border border-rose-200/50"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold tracking-widest text-rose-700">TIẾN ĐỘ QUYÊN GÓP</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-rose-600">{(campaign.progressPercent ?? 0).toFixed(1)}%</span>
                                        {(campaign.progressPercent ?? 0) === 100 && (
                                            <span className="inline-block px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-700 text-xs font-bold">✓ Hoàn thành</span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-rose-200/30 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${campaign.progressPercent ?? 0}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 shadow-lg relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center mt-2 text-xs text-black/50">
                                    <span>{formatVND(campaign.raisedAmount)}</span>
                                    <span>{formatVND(campaign.goalAmount)}</span>
                                </div>
                            </motion.div>

                            {/* Dates */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="space-y-2 text-sm border-t border-black/10 pt-4"
                            >
                                <div className="flex items-center gap-3 text-black/60 hover:text-black/80 transition-colors group cursor-default">
                                    <Calendar className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                                    <span className="truncate text-xs">Hạn: <span className="font-semibold text-black">{formatDate(campaign.deadline)}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-black/60 hover:text-black/80 transition-colors group cursor-default">
                                    <Calendar className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                                    <span className="truncate text-xs">Tạo: <span className="font-semibold text-black">{formatDate(campaign.createdAt)}</span></span>
                                </div>
                            </motion.div>

                            {/* Quick Links */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="pt-4 border-t border-black/10 space-y-2"
                            >
                                <Link href={`/dashboard/my-campaigns/${campaign.id}/analytics`} className="block">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="outline" size="sm" className="w-full hover:bg-black/5 active:scale-95">
                                            <BarChart3 className="w-4 h-4" />
                                            Xem thống kê
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Update Modal */}
            <UpdateModal
                campaignId={campaignId}
                isOpen={isUpdateModalOpen}
                onClose={handleCloseModal}
                updateToEdit={updateToEdit}
            />

            {/* Campaign Edit Modal */}
            <CampaignEditModal
                campaign={campaign}
                isOpen={isCampaignEditOpen}
                onClose={() => setIsCampaignEditOpen(false)}
            />

            {/* Update Detail Modal */}
            <UpdateDetailModal
                isOpen={isViewDetailOpen}
                update={selectedUpdateForView}
                onClose={() => {
                    setIsViewDetailOpen(false);
                    setSelectedUpdateForView(null);
                }}
                formatDate={formatDate}
            />
        </div>
    );
}
