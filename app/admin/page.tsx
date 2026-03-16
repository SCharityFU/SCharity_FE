'use client';

import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  ShieldBan,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Scale,
  Users,
  UserPen,
  Heart,
  Loader2,
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { UserRole } from '@/dtos';
import { useAppSelector } from '@/lib/store/hooks';
import { useGetAdminDashboardChartQuery, useGetAdminDashboardQuery } from '@/lib/store/features/admin/adminApi';
import { formatDateVN, formatVNDShort } from '@/lib/utils';
import { BentoGrid } from '@/components/ui/bento-grid';
import { NumberCounter, RollingCounter } from '@/components/ui/number-counter';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { HighlightText } from '@/components/ui/highlight-text';

const INTERVAL_OPTIONS = [
  { label: 'Theo ngày', value: 'day', days: 30 },
  { label: 'Theo tuần', value: 'week', days: 90 },
  { label: 'Theo tháng', value: 'month', days: 365 },
] as const;

type IntervalKey = (typeof INTERVAL_OPTIONS)[number]['value'];

function formatCurrencyVND(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')} VND`;
}

function toSafeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function StatCard({
  icon: Icon,
  label,
  value,
  isCurrency = false,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  isCurrency?: boolean;
  gradient: string;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${gradient} to-transparent flex flex-col justify-between`}
    >
      <Icon className="w-5 h-5 text-black/40 mb-3" />
      <div className="text-2xl md:text-3xl font-black text-black mb-1 leading-tight">
        {isCurrency ? (
          <NumberCounter
            value={value}
            duration={1.8}
            separator="."
            decimalSeparator=","
            suffix=" VND"
            easing="easeOut"
          />
        ) : (
          <RollingCounter value={value} separator="." />
        )}
      </div>
      <p className="text-sm text-black/50">{label}</p>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload?: { count?: number; rawAmount?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const rawAmount = payload[0]?.payload?.rawAmount ?? payload[0]?.value ?? 0;

  return (
    <div className="glass-card rounded-xl p-3 text-sm shadow-lg">
      <p className="font-semibold text-black mb-1">{formatDateVN(label)}</p>
      <p className="text-rose-500">
        Số tiền: <span className="font-bold">{formatCurrencyVND(rawAmount)}</span>
      </p>
      {payload[0]?.payload?.count !== undefined && (
        <p className="text-violet-500">
          Lượt quyên góp: <span className="font-bold">{payload[0].payload.count}</span>
        </p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  const [interval, setInterval] = useState<IntervalKey>('day');
  const currentOption = useMemo(
    () => INTERVAL_OPTIONS.find((opt) => opt.value === interval) ?? INTERVAL_OPTIONS[0],
    [interval],
  );

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetAdminDashboardQuery(undefined, {
    skip: !isAdmin,
    pollingInterval: 60_000,
  });

  const { data: chartResponse, isLoading: chartLoading } = useGetAdminDashboardChartQuery(
    { interval, days: currentOption.days },
    { skip: !isAdmin, pollingInterval: 60_000 },
  );

  const chartData = chartResponse?.data ?? [];

  const { chartSeries, useLogScale, logDomainMin } = useMemo(() => {
    const safeSeries = chartData.map((point) => {
      const rawAmount = Math.max(0, toSafeNumber((point as { amount?: unknown }).amount));
      const rawCount = Math.max(0, Math.floor(toSafeNumber((point as { count?: unknown }).count)));
      return {
        ...point,
        rawAmount,
        count: rawCount,
      };
    });

    const max = safeSeries.reduce((acc, item) => Math.max(acc, item.rawAmount), 0);
    const minNonZero = safeSeries.reduce((acc, item) => {
      if (item.rawAmount <= 0) return acc;
      if (acc === 0) return item.rawAmount;
      return Math.min(acc, item.rawAmount);
    }, 0);

    const ratio = minNonZero > 0 ? max / minNonZero : 1;
    const shouldUseLog = ratio >= 100;
    const computedLogMin =
      shouldUseLog && minNonZero > 0 ? Math.max(1000, Math.floor(minNonZero / 1000) * 1000 || minNonZero) : 1;

    return {
      useLogScale: shouldUseLog,
      logDomainMin: computedLogMin,
      chartSeries: safeSeries.map((item) => ({
        ...item,
        amountPlot: shouldUseLog
          ? item.rawAmount > 0
            ? Math.max(computedLogMin, item.rawAmount)
            : computedLogMin
          : item.rawAmount,
      })),
    };
  }, [chartData]);

  const logTicks = useMemo(() => {
    if (!useLogScale) return undefined;

    const maxRaw = chartSeries.reduce((acc, item) => Math.max(acc, item.rawAmount ?? 0), 0);
    if (maxRaw <= 0) return undefined;

    const ticks: number[] = [];
    for (let value = logDomainMin; value <= maxRaw * 1.001; value *= 10) {
      ticks.push(value);
      const halfStep = value * 5;
      if (halfStep <= maxRaw * 1.001) {
        ticks.push(halfStep);
      }
    }

    return Array.from(new Set(ticks)).sort((a, b) => a - b);
  }, [useLogScale, logDomainMin, chartSeries]);

  const logTickSet = useMemo(() => {
    if (!logTicks) return null;
    return new Set(logTicks.map((tick) => Math.round(tick)));
  }, [logTicks]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Tổng quan hệ thống</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="min-h-[360px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  if (statsError || !statsResponse?.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Không thể tải dữ liệu thống kê dashboard. Vui lòng thử lại.
      </div>
    );
  }

  const stats = statsResponse.data;

  const buildChartContent = () => (
    <div className="w-full h-[340px]">
      {chartLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="adminDonationAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDateVN(value)}
              tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.45)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => {
                if (useLogScale && logTickSet && !logTickSet.has(Math.round(value))) {
                  return '';
                }
                return formatVNDShort(value);
              }}
              tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.45)' }}
              axisLine={false}
              tickLine={false}
              width={82}
              scale={useLogScale ? 'log' : 'auto'}
              domain={useLogScale ? [logDomainMin, 'auto'] : ['auto', 'auto']}
              ticks={logTicks}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="amountPlot"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#adminDonationAmount)"
              dot={false}
              activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {useLogScale && (
        <p className="mt-2 text-xs text-black/45">
          Đang dùng thang log để hiển thị rõ các khoản donate chênh lệch lớn.
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-5 p-1">
      <div>
        <p className="text-black/40 text-sm mb-1 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Quản trị hệ thống
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-black">
          <HighlightText variant="underline" color="primary">
            Dashboard Tổng Quan
          </HighlightText>
        </h1>
      </div>

      <div>
        <h2 className="font-bold text-black text-lg mb-3 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-violet-500" />
          Tổng số dự án
        </h2>
        <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
          <StatCard
            icon={FolderKanban}
            label="Tổng số dự án"
            value={stats.totalCampaigns}
            gradient="from-violet-500/20"
          />
          <StatCard
            icon={CheckCircle2}
            label="Số dự án thành công"
            value={stats.successfulCampaigns}
            gradient="from-emerald-500/20"
          />
          <StatCard
            icon={ShieldBan}
            label="Số dự án bị suspend"
            value={stats.suspendedCampaigns}
            gradient="from-red-500/20"
          />
        </BentoGrid>
      </div>

      <div>
        <h2 className="font-bold text-black text-lg mb-3 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-rose-500" />
          Dòng tiền
        </h2>
        <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
          <StatCard
            icon={ArrowDownToLine}
            label="Tổng số tiền đã nhận"
            value={stats.totalDonationReceived}
            isCurrency
            gradient="from-rose-500/20"
          />
          <StatCard
            icon={ArrowUpFromLine}
            label="Tổng số tiền đã chi"
            value={stats.totalDonationPaid}
            isCurrency
            gradient="from-amber-500/20"
          />
          <StatCard
            icon={Scale}
            label="Tổng số tiền admin đang có"
            value={stats.adminBalance}
            isCurrency
            gradient="from-blue-500/20"
          />
        </BentoGrid>
      </div>

      <div>
        <h2 className="font-bold text-black text-lg mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          User
        </h2>
        <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
          <StatCard
            icon={UserPen}
            label="Tổng số Campaign Creator"
            value={stats.totalCampaignCreators}
            gradient="from-violet-500/20"
          />
          <StatCard icon={Heart} label="Tổng số Donor" value={stats.totalDonors} gradient="from-rose-500/20" />
          <StatCard icon={Users} label="Tổng lượng User" value={stats.totalUsers} gradient="from-blue-500/20" />
        </BentoGrid>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold text-black text-lg mb-2">Biểu đồ tăng trưởng dòng tiền quyên góp</h2>
        <p className="text-sm text-black/45 mb-4">Theo định dạng ngày: dd/mm/yyyy</p>

        <VercelTabs
          tabs={INTERVAL_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
            content: buildChartContent(),
          }))}
          defaultTab={interval}
          onTabChange={(value) => setInterval(value as IntervalKey)}
        />
      </div>
    </div>
  );
}
