"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Heart,
  Users,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
} from "lucide-react";
import { CampaignStatus, CampaignCategory } from "@/dtos/enums";
import type { CampaignDto } from "@/dtos/campaign";
import { HighlightText } from "@/components/ui/highlight-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useGetMyCampaignsQuery } from "@/lib/store/features/campaign/campaignApi";
import {
  formatCampaignProgressPercent,
  formatVND,
  resolveCampaignProgressPercent,
} from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  [CampaignStatus.PENDING]: {
    label: "Chờ duyệt",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  [CampaignStatus.ACTIVE]: {
    label: "Đang chạy",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  [CampaignStatus.CLOSED]: {
    label: "Đã đóng",
    color: "text-gray-500 bg-gray-500/10 border-gray-500/20",
  },
  [CampaignStatus.SUSPENDED]: {
    label: "Tạm dừng",
    color: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  [CampaignStatus.COMPLETED]: {
    label: "Hoàn thành",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  [CampaignStatus.WITHDRAWN]: {
    label: "Đã rút",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  [CampaignCategory.DAVA]: "Nạn nhân chất độc da cam",
  [CampaignCategory.EDUCATION]: "Giáo dục",
  [CampaignCategory.MEDICAL]: "Y tế",
  [CampaignCategory.DISASTER]: "Thiên tai",
  [CampaignCategory.COMMUNITY]: "Cộng đồng",
  [CampaignCategory.ENVIRONMENT]: "Môi trường",
  [CampaignCategory.OTHER]: "Khác",
};

function toSafeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.trim().replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function MyCampaignsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useGetMyCampaignsQuery({ page, limit });

  const campaigns = data?.data ?? [];
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
                Chiến Dịch Của Tôi
              </HighlightText>
            </h1>
            <p className="text-black/50 text-sm mt-2">Quản lý các chiến dịch gây quỹ bạn đã tạo</p>
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
                <div className="h-4 bg-black/10 rounded w-full mb-2" />
                <div className="h-3 bg-black/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && campaigns.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/50 text-lg mb-2">Chưa có chiến dịch nào</p>
            <p className="text-black/30 text-sm mb-6">
              Bắt đầu gây quỹ bằng cách tạo chiến dịch đầu tiên
            </p>
            <Link href="/campaigns/create">
              <Button>
                <Plus className="w-4 h-4" />
                Tạo Chiến Dịch
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && campaigns.length > 0 && (
          <>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {campaigns.map((c: CampaignDto, i: number) => {
                  const statusCfg =
                    STATUS_LABELS[c.status] ?? STATUS_LABELS[CampaignStatus.PENDING];
                  const remaining = daysLeft(c.deadline);
                  const raisedAmount = toSafeNumber(c.raisedAmount);
                  const goalAmount = toSafeNumber(c.goalAmount);
                  const progress = resolveCampaignProgressPercent({
                    progressPercent: c.progressPercent,
                    raisedAmount,
                    goalAmount,
                  });
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-black text-lg truncate">{c.title}</h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </span>
                            {c.category && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-black/5 text-black/50 border border-black/10">
                                {CATEGORY_LABELS[c.category] ?? c.category}
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-black/50 mb-1">
                              <span>{formatVND(raisedAmount)}</span>
                              <span>{formatCampaignProgressPercent(progress)}</span>
                            </div>
                            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-400 to-violet-500 rounded-full transition-all duration-500"
                                style={{ width: `${String(progress)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-black/40 mt-1">
                              <span>Mục tiêu: {formatVND(goalAmount)}</span>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-sm text-black/40">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {c.donorCount} nhà hảo tâm
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {remaining > 0 ? `${remaining} ngày còn lại` : "Đã hết hạn"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <Link href={`/campaigns/${c.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                              Xem
                            </Button>
                          </Link>
                          <Link href={`/dashboard/my-campaigns/${c.id}/analytics`}>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="w-3.5 h-3.5" />
                              Thống kê
                            </Button>
                          </Link>
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
