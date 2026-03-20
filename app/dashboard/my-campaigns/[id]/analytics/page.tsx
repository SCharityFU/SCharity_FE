'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Heart, Target, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGetCampaignDonationsQuery,
  useGetCreatorCampaignAnalyticsQuery,
  useGetMyCampaignsQuery,
  useLazyGetCampaignDonationsQuery,
} from '@/lib/store/features/campaign/campaignApi';
import type { CampaignDto } from '@/dtos/campaign';
import { CampaignStatus } from '@/dtos/enums';
import { cn, formatDateVN, resolveCampaignProgressPercent } from '@/lib/utils';
import { formatVND } from '@/lib/money';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return formatDateVN(iso);

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  return formatDateVN(iso);
}

function compactMoneyTick(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function statusLabel(status: CampaignStatus): string {
  switch (status) {
    case CampaignStatus.REJECTED:
      return 'Từ chối';
    case CampaignStatus.ACTIVE:
      return 'Đang hoạt động';
    case CampaignStatus.CLOSED:
      return 'Đã đóng';
    case CampaignStatus.SUSPENDED:
      return 'Tạm dừng';
    case CampaignStatus.COMPLETED:
      return 'Hoàn thành';
    case CampaignStatus.WITHDRAWN:
      return 'Đã rút tiền';
    default:
      return 'Chờ duyệt';
  }
}

function statusClass(status: CampaignStatus): string {
  switch (status) {
    case CampaignStatus.REJECTED:
      return 'bg-rose-100 text-rose-700';
    case CampaignStatus.ACTIVE:
      return 'bg-emerald-100 text-emerald-700';
    case CampaignStatus.CLOSED:
      return 'bg-gray-100 text-gray-700';
    case CampaignStatus.SUSPENDED:
      return 'bg-amber-100 text-amber-700';
    case CampaignStatus.COMPLETED:
      return 'bg-blue-100 text-blue-700';
    case CampaignStatus.WITHDRAWN:
      return 'bg-violet-100 text-violet-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function DonorAvatar({ name, anonymous }: { name: string; anonymous: boolean }) {
  if (anonymous) {
    return (
      <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <Heart className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaignsData, isLoading } = useGetMyCampaignsQuery({
    page: 1,
    limit: 100,
  });

  console.log('My campaigns data:', campaignsData);

  const campaign = campaignsData?.data?.find((c) => c.id === campaignId) as CampaignDto | undefined;

  const [timeRange, setTimeRange] = useState<number>(30);
  const [page, setPage] = useState(1);

  const queryDays = useMemo(() => {
    if (timeRange !== -1) return timeRange;
    if (campaign?.createdAt) {
      return Math.max(1, Math.ceil((Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    }
    return 30;
  }, [timeRange, campaign?.createdAt]);

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetCreatorCampaignAnalyticsQuery(
    { campaignId, days: queryDays },
    { skip: !campaignId, pollingInterval: 15000 },
  );

  const { data: donationsData, isLoading: isDonationsLoading } = useGetCampaignDonationsQuery(
    { campaignId, page, limit: 10 },
    { skip: !campaignId, pollingInterval: 15000 },
  );

  const [fetchDonations] = useLazyGetCampaignDonationsQuery();

  const handleExport = async () => {
    if (!campaign) return;

    try {
      const result = await fetchDonations({ campaignId, page: 1, limit: 1000 }).unwrap();
      const donations = result.data ?? [];

      let csvContent = '\uFEFFNgười ủng hộ,Số tiền (VND),Lời nhắn,Thời gian\n';
      donations.forEach((donation) => {
        const donorName = donation.donorDisplayName || 'Nhà hảo tâm ẩn danh';
        const escapedMessage = donation.message ? `"${donation.message.replace(/"/g, '""')}"` : '';
        csvContent += `"${donorName}",${donation.amount},${escapedMessage},"${formatDateVN(donation.createdAt)}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${campaign.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-black/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-black/10 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-black/10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-black/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Chiến dịch không tìm thấy</h1>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const chartData = analyticsData?.data?.chartData || [];
  const progress = resolveCampaignProgressPercent({
    progressPercent: campaign.progressPercent,
    raisedAmount: campaign.raisedAmount,
    goalAmount: campaign.goalAmount,
  });
  const totalDonationTransactions = chartData.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const timeRangeLabel = timeRange === -1 ? 'Toàn bộ thời gian' : `${timeRange} ngày qua`;

  const stats = [
    {
      label: 'Số tiền đã gây quỹ',
      value: formatVND(campaign.raisedAmount),
      icon: Heart,
      color: 'from-emerald-50 to-emerald-100/50',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Mục tiêu',
      value: formatVND(campaign.goalAmount),
      icon: Target,
      color: 'from-rose-50 to-rose-100/50',
      borderColor: 'border-rose-200/50',
      textColor: 'text-rose-700',
    },
    {
      label: 'Số lượt ủng hộ',
      value: totalDonationTransactions.toLocaleString('vi-VN'),
      icon: Users,
      color: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Thời gian còn lại',
      value: daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã hết hạn',
      icon: TrendingUp,
      color: 'from-violet-50 to-violet-100/50',
      borderColor: 'border-violet-200/50',
      textColor: 'text-violet-700',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-black/[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/my-campaigns/${campaign.id}`}>
            <button className="flex items-center gap-1 text-sm text-black/40 hover:text-black/70 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-black mb-2">Thống kê: {campaign.title}</h1>
              <p className="text-black/50">Theo dõi dòng tiền và danh sách người ủng hộ</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="h-9 px-3 bg-white border border-black/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-rose-500 text-black appearance-none pr-8 relative cursor-pointer hover:bg-black/5 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1em',
                }}
              >
                <option value={7}>7 ngày qua</option>
                <option value={30}>30 ngày qua</option>
                <option value={90}>90 ngày qua</option>
                <option value={-1}>Toàn bộ thời gian</option>
              </select>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4" />
                Tải báo cáo
              </Button>
            </div>
          </div>
          <p className="text-sm text-black/45 mt-2">Bộ lọc hiện tại: {timeRangeLabel}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border ${stat.borderColor}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-black/40 mb-2 uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-6 h-6 ${stat.textColor} opacity-30`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[260px] flex-1">
              <p className="text-sm text-black/50">Trạng thái chiến dịch</p>
              <span
                className={cn(
                  'inline-flex mt-1 px-3 py-1 rounded-full text-xs font-bold',
                  statusClass(campaign.status),
                )}
              >
                {statusLabel(campaign.status)}
              </span>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-black/55 uppercase tracking-wide">Tiến độ</p>
                  <p className="text-sm font-bold text-emerald-600">{progress.toFixed(1)}%</p>
                </div>
                <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-black/50">Thời hạn</p>
              <p className="text-sm font-semibold text-black">{formatDateVN(campaign.deadline)}</p>
            </div>
          </div>

          <p className="text-sm text-black/60 mt-3 font-medium">
            Đạt {progress.toFixed(1)}% - {formatVND(campaign.raisedAmount)} / {formatVND(campaign.goalAmount)}
          </p>
        </div>

        {/* Chart Section */}
        <div className="mt-6 glass-card rounded-2xl p-6">
          <h3 className="font-bold text-black text-lg mb-6">Biểu đồ đóng góp theo thời gian</h3>
          <div className="h-72">
            {isAnalyticsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-black/40 text-sm">
                Đang tải biểu đồ...
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-black/40 text-sm">
                Chưa có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => formatDateVN(val).slice(0, 5)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => compactMoneyTick(Number(val) || 0)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [formatVND(Number(value) || 0), 'Số tiền']}
                    labelFormatter={(label, payload) => {
                      const count = payload?.[0]?.payload?.count ?? 0;
                      return `${formatDateVN(label as string)} - ${count} lượt ủng hộ`;
                    }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donor List */}
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h3 className="font-bold text-black text-lg mb-6">Danh sách người ủng hộ gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Người ủng hộ</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Số tiền</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Lời nhắn</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {isDonationsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-black/40">
                      Đang tải...
                    </td>
                  </tr>
                ) : donationsData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-black/40">
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  donationsData?.data?.map((d) => (
                    <tr key={d.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                      <td className="py-3 px-4 text-sm text-black">
                        <div className="flex items-center gap-3">
                          <DonorAvatar name={d.donorDisplayName || 'Nhà hảo tâm ẩn danh'} anonymous={d.isAnonymous} />
                          <span className="font-medium">{d.donorDisplayName || 'Nhà hảo tâm ẩn danh'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-600">{formatVND(d.amount)}</td>
                      <td className="py-3 px-4 text-sm text-black/60 max-w-xs truncate">{d.message || '-'}</td>
                      <td className="py-3 px-4 text-sm text-black/40 whitespace-nowrap">
                        <span title={formatDateVN(d.createdAt)}>{formatRelativeTime(d.createdAt)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-600">{formatVND(d.amount)}</td>
                      <td className="py-3 px-4 text-sm text-black/60 max-w-xs truncate">{d.message || '-'}</td>
                      <td className="py-3 px-4 text-sm text-black/40 whitespace-nowrap">{formatDateVN(d.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {donationsData?.pagination && donationsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-black/40">
                Trang {page} / {donationsData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(donationsData.pagination.totalPages, p + 1))}
                  disabled={page === donationsData.pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
