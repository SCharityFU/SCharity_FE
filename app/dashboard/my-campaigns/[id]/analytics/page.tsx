'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Users, Heart, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGetMyCampaignsQuery,
  useGetCreatorCampaignAnalyticsQuery,
  useGetCampaignDonationsQuery,
} from '@/lib/store/features/campaign/campaignApi';
import type { CampaignDto } from '@/dtos/campaign';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatVND(value: number): string {
  return value.toLocaleString('vi-VN') + ' ₫';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const { data: campaignsData, isLoading } = useGetMyCampaignsQuery({
    page: 1,
    limit: 100,
  });

  const campaign = campaignsData?.data?.find((c) => c.id === campaignId) as CampaignDto | undefined;

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetCreatorCampaignAnalyticsQuery(
    { campaignId },
    { skip: !campaignId }
  );

  const [page, setPage] = useState(1);
  const { data: donationsData, isLoading: isDonationsLoading } = useGetCampaignDonationsQuery(
    { campaignId, page, limit: 10 },
    { skip: !campaignId }
  );

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

  // Calculate some basic metrics
  const conversionRate = campaign.donorCount > 0 ? ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1) : 0;
  const averageDonation = campaign.donorCount > 0 ? campaign.raisedAmount / campaign.donorCount : 0;
  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const chartData = analyticsData?.data?.chartData || [];

  const stats = [
    {
      label: 'Mục tiêu',
      value: formatVND(campaign.goalAmount),
      icon: Target,
      color: 'from-rose-50 to-rose-100/50',
      borderColor: 'border-rose-200/50',
      textColor: 'text-rose-700',
    },
    {
      label: 'Đã quyên góp',
      value: formatVND(campaign.raisedAmount),
      icon: Heart,
      color: 'from-emerald-50 to-emerald-100/50',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Nhà hảo tâm',
      value: `${campaign.donorCount}`,
      icon: Users,
      color: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Tiến độ',
      value: `${(campaign.progressPercent ?? 0).toFixed(0)}%`,
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-black mb-2">{campaign.title}</h1>
              <p className="text-black/50">Thống kê &amp; Phân tích</p>
            </div>
            <Button>
              <Download className="w-4 h-4" />
              Tải báo cáo
            </Button>
          </div>
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Info */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-black text-lg">Thông tin chiến dịch</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-black/50 font-semibold mb-1">Trạng thái</p>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {campaign.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-black/50 font-semibold mb-1">Tạo ngày</p>
                  <p className="text-sm font-medium text-black">{formatDate(campaign.createdAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-black/50 font-semibold mb-1">Hạn chót</p>
                  <p className="text-sm font-medium text-black">{formatDate(campaign.deadline)}</p>
                </div>

                <div>
                  <p className="text-xs text-black/50 font-semibold mb-1">Ngày còn lại</p>
                  <p className="text-sm font-medium text-rose-600">
                    {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Hết hạn'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-black text-lg">Hiệu suất</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/5 rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-2 font-semibold">Tỷ lệ chuyển đổi</p>
                  <p className="text-3xl font-black text-black">{conversionRate}%</p>
                  <p className="text-xs text-black/40 mt-1">So với mục tiêu</p>
                </div>

                <div className="bg-black/5 rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-2 font-semibold">Quyên góp trung bình</p>
                  <p className="text-2xl font-black text-black">{formatVND(averageDonation)}</p>
                  <p className="text-xs text-black/40 mt-1">Mỗi nhà tài trợ</p>
                </div>

                <div className="bg-black/5 rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-2 font-semibold">Ngày hoạt động</p>
                  <p className="text-3xl font-black text-black">{daysElapsed}</p>
                  <p className="text-xs text-black/40 mt-1">Từ ngày tạo</p>
                </div>

                <div className="bg-black/5 rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-2 font-semibold">Tốc độ quyên góp</p>
                  <p className="text-2xl font-black text-black">
                    {formatVND(daysElapsed > 0 ? campaign.raisedAmount / daysElapsed : 0)}
                  </p>
                  <p className="text-xs text-black/40 mt-1">Mỗi ngày</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-rose-700">TIẾN ĐỘ TỔNG THỂ</span>
                  <span className="text-2xl font-black text-rose-600">
                    {(campaign.progressPercent ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden border border-rose-200/30">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 via-violet-500 to-rose-400 shadow-lg"
                    style={{ width: `${campaign.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mt-6 glass-card rounded-2xl p-6">
          <h3 className="font-bold text-black text-lg mb-6">Quyên góp 30 ngày gần đây</h3>
          <div className="h-72">
            {isAnalyticsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-black/40 text-sm">Đang tải biểu đồ...</div>
            ) : chartData.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-black/40 text-sm">Chưa có dữ liệu</div>
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
                    tickFormatter={(val) => formatDate(val).substring(0, 5)} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatVND(Number(value) || 0), 'Số tiền']}
                    labelFormatter={(label) => formatDate(label as string)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donor List */}
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h3 className="font-bold text-black text-lg mb-6">Danh sách quyên góp</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Nhà hảo tâm</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Số tiền</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Lời nhắn</th>
                  <th className="py-3 px-4 text-xs font-semibold text-black/50 uppercase">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {isDonationsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-black/40">Đang tải...</td>
                  </tr>
                ) : donationsData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-black/40">Chưa có giao dịch nào</td>
                  </tr>
                ) : (
                  donationsData?.data?.map((d) => (
                    <tr key={d.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                      <td className="py-3 px-4 text-sm font-medium text-black">
                        {d.isAnonymous ? 'Nhà hảo tâm ẩn danh' : (d.donor?.fullName || 'Người dùng')}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-600">
                        {formatVND(d.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-black/60 max-w-xs truncate">
                        {d.message || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-black/40 whitespace-nowrap">
                        {formatDate(d.createdAt)}
                      </td>
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(donationsData.pagination.totalPages, p + 1))}
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

// Icon placeholder
function Target(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
