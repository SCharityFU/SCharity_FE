'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Users, Calendar, Plus, ChevronLeft, ChevronRight, Eye, Edit2 } from 'lucide-react';
import { CampaignStatus, CampaignCategory } from '@/dtos/enums';
import type { CampaignDto } from '@/dtos/campaign';
import { HighlightText } from '@/components/ui/highlight-text';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/ui/magnetic';
import { useGetMyCampaignsQuery } from '@/lib/store/features/campaign/campaignApi';
import { formatCampaignProgressPercent, resolveCampaignProgressPercent } from '@/lib/utils';
import { formatVND } from '@/lib/money';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  [CampaignStatus.PENDING]: { label: 'Chờ duyệt', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  [CampaignStatus.ACTIVE]: { label: 'Đang chạy', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  [CampaignStatus.CLOSED]: { label: 'Đã đóng', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
  [CampaignStatus.SUSPENDED]: { label: 'Tạm dừng', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  [CampaignStatus.COMPLETED]: { label: 'Hoàn thành', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  [CampaignStatus.WITHDRAWN]: { label: 'Đã rút', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
};

const CATEGORY_LABELS: Record<string, string> = {
  [CampaignCategory.EDUCATION]: 'Giáo dục',
  [CampaignCategory.MEDICAL]: 'Y tế',
  [CampaignCategory.DISASTER]: 'Thiên tai',
  [CampaignCategory.COMMUNITY]: 'Cộng đồng',
  [CampaignCategory.ENVIRONMENT]: 'Môi trường',
  [CampaignCategory.OTHER]: 'Khác',
};

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
              onClick={() => router.push('/dashboard')}
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
                colors={['#f43f5e', '#8b5cf6', '#f43f5e']}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {['s1', 's2', 's3', 's4', 's5', 's6'].map((key) => (
              <div key={key} className="glass-card rounded-2xl overflow-hidden animate-pulse flex flex-col">
                <div className="h-40 bg-black/10" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-black/10 rounded w-3/4" />
                  <div className="h-3 bg-black/10 rounded w-full" />
                  <div className="h-3 bg-black/10 rounded w-2/3" />
                  <div className="h-8 bg-black/10 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && campaigns.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/50 text-lg mb-2">Chưa có chiến dịch nào</p>
            <p className="text-black/30 text-sm mb-6">Bắt đầu gây quỹ bằng cách tạo chiến dịch đầu tiên</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {campaigns.map((c: CampaignDto, i: number) => {
                  const statusCfg = STATUS_LABELS[c.status] ?? STATUS_LABELS[CampaignStatus.PENDING];
                  const remaining = daysLeft(c.deadline);
                  const progress = resolveCampaignProgressPercent({
                    progressPercent: c.progressPercent,
                    raisedAmount: c.raisedAmount,
                    goalAmount: c.goalAmount,
                  });
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-40 bg-black/5">
                        {c.thumbnailUrl && (
                          <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <span
                          className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col">
                        {/* Title & Category */}
                        <h3 className="font-bold text-black text-sm leading-snug mb-2 line-clamp-2">{c.title}</h3>
                        {c.category && (
                          <span className="text-[11px] bg-black/5 text-black/60 px-2 py-0.5 rounded-full w-fit mb-3">
                            {CATEGORY_LABELS[c.category] ?? c.category}
                          </span>
                        )}

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-black/50 mb-1">
                            <span>{formatVND(c.raisedAmount)}</span>
                            <span>{formatCampaignProgressPercent(progress)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-400 to-violet-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-1 mb-4 text-xs text-black/50">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {c.donorCount} người
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {remaining > 0 ? `${remaining} ngày` : 'Hết hạn'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <Link href={`/dashboard/my-campaigns/${c.id}`} className="flex-1">
                            <button className="w-full px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-1">
                              <Eye className="w-3 h-3" />
                              Chi tiết
                            </button>
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
