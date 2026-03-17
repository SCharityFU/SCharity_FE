'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  FileText,
  Folder,
  ShieldAlert,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { RollingCounter } from '@/components/ui/number-counter';
import { BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'nextjs-toploader/app';
import {
  useGetCreatorDashboardQuery,
  useLazyGetCreatorDashboardQuery,
} from '@/lib/store/features/campaign/campaignApi';
import type {
  CreatorDashboardCampaignPreviewDto,
  CreatorDashboardDonationPreviewDto,
  CreatorDashboardResponseDto,
} from '@/dtos/creator';
import { formatCampaignProgressPercent, formatDateOnly, formatVND, resolveCampaignProgressPercent } from '@/lib/utils';

const DASHBOARD_QUERY = {
  campaignLimit: 3,
  donationLimit: 5,
  timezone: 'Asia/Ho_Chi_Minh',
};

function mergeUniqueById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return current;
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function fallbackDaysLeft(deadline: string, apiDaysLeft: number): number {
  if (Number.isFinite(apiDaysLeft)) return Math.max(0, apiDaysLeft);
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetCreatorDashboardQuery(DASHBOARD_QUERY);
  const [fetchDashboardMore] = useLazyGetCreatorDashboardQuery();

  const [dashboard, setDashboard] = useState<CreatorDashboardResponseDto | null>(null);
  const [isLoadingMoreDonations, setIsLoadingMoreDonations] = useState(false);
  const [isLoadingMoreCampaigns, setIsLoadingMoreCampaigns] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!data?.data) return;
    setDashboard(data.data);
  }, [data]);

  const recentDonations = dashboard?.recentDonationsToMyCampaigns ?? [];
  const myCampaignsPreview = dashboard?.myCampaignsPreview ?? [];

  const stats = useMemo(
    () => [
      {
        label: 'Tổng Quyên Góp',
        value: dashboard?.summary.totalRaisedAmount ?? 0,
        prefix: '₫',
        suffix: '',
        icon: Heart,
        color: 'from-rose-500/20',
      },
      {
        label: 'Chiến Dịch Đang Chạy',
        value: dashboard?.summary.activeCampaignCount ?? 0,
        suffix: '',
        icon: TrendingUp,
        color: 'from-violet-500/20',
      },
      {
        label: 'Ngày Tham Gia',
        value: dashboard?.summary.daysSinceJoined ?? 0,
        suffix: '',
        icon: Clock,
        color: 'from-blue-500/20',
      },
      {
        label: 'Tác Động (Người)',
        value: dashboard?.summary.totalDonorCount ?? 0,
        suffix: '+',
        icon: ArrowUpRight,
        color: 'from-emerald-500/20',
      },
    ],
    [dashboard],
  );

  const handleLoadMoreDonations = async () => {
    const nextCursor = dashboard?.recentDonationsPagination?.nextCursor;
    if (!nextCursor || isLoadingMoreDonations) return;

    setIsLoadingMoreDonations(true);
    try {
      const response = await fetchDashboardMore({ ...DASHBOARD_QUERY, donationCursor: nextCursor }).unwrap();
      const responseData = response.data;
      if (!responseData) return;

      setDashboard((prev) => {
        if (!prev) return responseData;
        return {
          ...prev,
          summary: responseData.summary,
          quickNav: responseData.quickNav,
          alerts: responseData.alerts,
          updatedAt: responseData.updatedAt,
          recentDonationsToMyCampaigns: mergeUniqueById(
            prev.recentDonationsToMyCampaigns,
            responseData.recentDonationsToMyCampaigns,
          ),
          recentDonationsPagination: responseData.recentDonationsPagination,
        };
      });
    } finally {
      setIsLoadingMoreDonations(false);
    }
  };

  const handleLoadMoreCampaigns = async () => {
    const nextCursor = dashboard?.myCampaignsPreviewPagination?.nextCursor;
    if (!nextCursor || isLoadingMoreCampaigns) return;

    setIsLoadingMoreCampaigns(true);
    try {
      const response = await fetchDashboardMore({ ...DASHBOARD_QUERY, campaignCursor: nextCursor }).unwrap();
      const responseData = response.data;
      if (!responseData) return;

      setDashboard((prev) => {
        if (!prev) return responseData;
        return {
          ...prev,
          summary: responseData.summary,
          quickNav: responseData.quickNav,
          alerts: responseData.alerts,
          updatedAt: responseData.updatedAt,
          myCampaignsPreview: mergeUniqueById(prev.myCampaignsPreview, responseData.myCampaignsPreview),
          myCampaignsPreviewPagination: responseData.myCampaignsPreviewPagination,
        };
      });
    } finally {
      setIsLoadingMoreCampaigns(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="text-black/40 text-sm mb-1">Chào mừng trở lại</p>
            <h1 className="text-3xl md:text-4xl font-black text-black">
              <HighlightText variant="underline" color="primary">
                Dashboard
              </HighlightText>
            </h1>
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
                Tạo Chiến Dịch
              </RainbowButton>
            </Link>
          </Magnetic>
        </div>

        <BentoGrid className="mb-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${stat.color} to-transparent`}
            >
              <stat.icon className="w-5 h-5 text-black/40 mb-3" />
              <div className="text-3xl font-black text-black mb-1">
                <RollingCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-black/50">{stat.label}</p>
            </div>
          ))}
        </BentoGrid>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/dashboard/my-requests"
            className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-black text-sm">Yêu Cầu Tạo Chiến Dịch</p>
              <p className="text-xs text-black/40">
                Đang chờ duyệt: {dashboard?.quickNav.myRequestsPending ?? 0} / Tổng:{' '}
                {dashboard?.quickNav.myRequestsTotal ?? 0}
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-black/20 group-hover:text-black/50 transition-colors" />
          </Link>
          <Link
            href="/dashboard/my-campaigns"
            className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-transparent flex items-center justify-center">
              <Folder className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-black text-sm">Chiến Dịch Của Tôi</p>
              <p className="text-xs text-black/40">
                Đang chạy: {dashboard?.quickNav.myCampaignsActive ?? 0} / Tổng:{' '}
                {dashboard?.quickNav.myCampaignsTotal ?? 0}
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-black/20 group-hover:text-black/50 transition-colors" />
          </Link>
        </div>

        <div className="mb-10">
          <div
            className={`rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border shadow-lg ${
              (dashboard?.kyc.isKycVerified ?? user?.isKycVerified)
                ? 'bg-emerald-50/50 border-emerald-100'
                : 'bg-rose-50/50 border-rose-100'
            }`}
          >
            <div className="flex items-start gap-4 mb-4 sm:mb-0">
              {(dashboard?.kyc.isKycVerified ?? user?.isKycVerified) ? (
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3
                  className={`text-xl font-bold mb-1 ${(dashboard?.kyc.isKycVerified ?? user?.isKycVerified) ? 'text-emerald-950' : 'text-rose-950'}`}
                >
                  {(dashboard?.kyc.isKycVerified ?? user?.isKycVerified) ? 'Đã Xác Thực eKYC' : 'Chưa Xác Thực eKYC'}
                </h3>
                <p
                  className={`text-sm ${(dashboard?.kyc.isKycVerified ?? user?.isKycVerified) ? 'text-emerald-800/70' : 'text-rose-800/70'} max-w-xl`}
                >
                  {(dashboard?.kyc.isKycVerified ?? user?.isKycVerified)
                    ? 'Danh tính của bạn đã được đối chiếu với giấy tờ hợp lệ. Bạn hiện có đầy đủ quyền để rút tiền và thực hiện các giao dịch lớn.'
                    : 'Bạn cần xác thực danh tính để đảm bảo an toàn cho tài khoản và mở khóa tính năng rút quỹ. Quá trình này chỉ mất 2 phút.'}
                </p>
              </div>
            </div>

            {!(dashboard?.kyc.isKycVerified ?? user?.isKycVerified) && (
              <Link href="/kyc" className="w-full sm:w-auto mt-2 sm:mt-0">
                <RainbowButton colors={['#f43f5e', '#8b5cf6', '#f43f5e']} className="w-full whitespace-nowrap px-8">
                  Xác Thực Ngay
                </RainbowButton>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black">Quyên Góp Gần Đây</h2>
              <Link
                href="/dashboard/my-campaigns"
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                Xem tất cả <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {isLoading && (
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-black/5 animate-pulse" />
                <div className="h-16 rounded-xl bg-black/5 animate-pulse" />
                <div className="h-16 rounded-xl bg-black/5 animate-pulse" />
              </div>
            )}

            {!isLoading && recentDonations.length === 0 && (
              <p className="text-sm text-black/45">Chưa có giao dịch quyên góp vào chiến dịch của bạn.</p>
            )}

            {!isLoading && recentDonations.length > 0 && (
              <>
                <div className="space-y-4">
                  {recentDonations.map((d: CreatorDashboardDonationPreviewDto) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-4 pb-4 border-b border-black/10 last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{d.campaignTitle}</p>
                        <p className="text-xs text-black/40">{d.relativeTimeLabel || formatDateOnly(d.createdAt)}</p>
                      </div>
                      <div className="text-rose-500 font-bold text-sm shrink-0">+{formatVND(d.amount)}</div>
                    </div>
                  ))}
                </div>

                {dashboard?.recentDonationsPagination.hasMore && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isLoadingMoreDonations}
                      onClick={handleLoadMoreDonations}
                    >
                      {isLoadingMoreDonations ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải thêm
                        </>
                      ) : (
                        'Tải thêm quyên góp'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black">Chiến Dịch Của Tôi</h2>
              <Link
                href="/dashboard/my-campaigns"
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                Xem tất cả <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading && (
              <div className="space-y-3">
                <div className="h-24 rounded-xl bg-black/5 animate-pulse" />
                <div className="h-24 rounded-xl bg-black/5 animate-pulse" />
              </div>
            )}

            {!isLoading && myCampaignsPreview.length === 0 && (
              <p className="text-sm text-black/45">Bạn chưa có chiến dịch nào.</p>
            )}

            {!isLoading && myCampaignsPreview.length > 0 && (
              <>
                <div className="space-y-5">
                  {myCampaignsPreview.map((c: CreatorDashboardCampaignPreviewDto) => {
                    const progress = resolveCampaignProgressPercent({
                      progressPercent: c.progressPercent,
                      raisedAmount: c.raisedAmount,
                      goalAmount: c.goalAmount,
                    });
                    return (
                      <div
                        key={c.id}
                        className="glass rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/dashboard/my-campaigns/${c.id}`)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 overflow-hidden shrink-0">
                            {c.thumbnailUrl ? (
                              <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-black/25 text-xs">
                                CD
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{c.title}</p>
                            <div className="flex gap-3 text-xs text-black/40 mt-0.5">
                              <span>{c.donorCount} nhà hảo tâm</span>
                              <span>{fallbackDaysLeft(c.deadline, c.daysLeft)} ngày còn lại</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-500">
                            {formatCampaignProgressPercent(progress)}
                          </span>
                        </div>

                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-black/40">
                          <span>{formatVND(c.raisedAmount)}</span>
                          <span>Mục tiêu: {formatVND(c.goalAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {dashboard?.myCampaignsPreviewPagination.hasMore && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isLoadingMoreCampaigns}
                      onClick={handleLoadMoreCampaigns}
                    >
                      {isLoadingMoreCampaigns ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải thêm
                        </>
                      ) : (
                        'Tải thêm chiến dịch'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isError && (
          <div className="mt-8 text-sm text-red-600">Không thể tải dashboard creator. Vui lòng thử lại sau.</div>
        )}
      </div>
    </div>
  );
}
