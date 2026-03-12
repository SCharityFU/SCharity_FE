"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

import { useAuth } from "@/hooks/useAuth";
import {
  useGetDashboardStatsQuery,
  useGetDonationChartDataQuery,
} from "@/lib/store/features/admin/adminApi";
import { formatVND, formatVNDShort, formatDateVN } from "@/lib/utils";

import { HighlightText } from "@/components/ui/highlight-text";
import { BentoGrid } from "@/components/ui/bento-grid";
import { RollingCounter, NumberCounter } from "@/components/ui/number-counter";
import { VercelTabs } from "@/components/ui/vercel-tabs";

// ── Interval config ────────────────────────────────────────────────────────
const INTERVAL_OPTIONS = [
  { label: "Theo ngày", value: "day", days: 30 },
  { label: "Theo tuần", value: "week", days: 90 },
  { label: "Theo tháng", value: "month", days: 365 },
] as const;

type IntervalKey = (typeof INTERVAL_OPTIONS)[number]["value"];

const ADMIN_DASHBOARD_PREVIEW =
  process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PREVIEW === "true";

const MOCK_STATS = {
  totalCampaigns: 128,
  successfulCampaigns: 74,
  suspendedCampaigns: 6,
  totalDonationReceived: 2485000000,
  totalDonationPaid: 1732000000,
  adminBalance: 752800000,
  totalCampaignCreators: 312,
  totalDonors: 5380,
  totalUsers: 6132,
};

const MOCK_CHART_DATA: Record<IntervalKey, Array<{ date: string; amount: number; count: number }>> = {
  day: [
    { date: "2026-02-12", amount: 52000000, count: 124 },
    { date: "2026-02-17", amount: 48000000, count: 115 },
    { date: "2026-02-22", amount: 61000000, count: 140 },
    { date: "2026-02-27", amount: 57000000, count: 131 },
    { date: "2026-03-03", amount: 69000000, count: 152 },
    { date: "2026-03-08", amount: 64000000, count: 146 },
    { date: "2026-03-12", amount: 71000000, count: 160 },
  ],
  week: [
    { date: "2025-12-19", amount: 298000000, count: 705 },
    { date: "2026-01-02", amount: 312000000, count: 742 },
    { date: "2026-01-16", amount: 286000000, count: 681 },
    { date: "2026-01-30", amount: 335000000, count: 789 },
    { date: "2026-02-13", amount: 358000000, count: 833 },
    { date: "2026-02-27", amount: 341000000, count: 804 },
    { date: "2026-03-12", amount: 367000000, count: 861 },
  ],
  month: [
    { date: "2025-04-01", amount: 840000000, count: 1910 },
    { date: "2025-06-01", amount: 925000000, count: 2134 },
    { date: "2025-08-01", amount: 1010000000, count: 2296 },
    { date: "2025-10-01", amount: 963000000, count: 2180 },
    { date: "2025-12-01", amount: 1090000000, count: 2475 },
    { date: "2026-02-01", amount: 1145000000, count: 2612 },
    { date: "2026-03-01", amount: 1180000000, count: 2721 },
  ],
};

// ── Stat card ──────────────────────────────────────────────────────────────
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
      <div className="text-3xl font-black text-black mb-1">
        {isCurrency ? (
          <NumberCounter
            value={value}
            duration={2}
            separator="."
            decimalSeparator=","
            suffix=" ₫"
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

// ── Chart tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 text-sm shadow-lg">
      <p className="font-semibold text-black mb-1">{formatDateVN(label)}</p>
      <p className="text-rose-500">
        Số tiền: <span className="font-bold">{formatVND(payload[0].value)}</span>
      </p>
      {payload[0]?.payload?.count !== undefined && (
        <p className="text-violet-500">
          Lượt quyên góp: <span className="font-bold">{payload[0].payload.count}</span>
        </p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isPreviewMode = ADMIN_DASHBOARD_PREVIEW;
  const canAccessAdmin = isAuthenticated && user?.role === "admin";

  const [interval, setInterval] = useState<IntervalKey>("day");
  const currentOption = INTERVAL_OPTIONS.find((o) => o.value === interval)!;

  // ── RTK Query hooks ──────────────────────────────────────────────────────
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetDashboardStatsQuery(undefined, {
    skip: isPreviewMode,
    pollingInterval: 60_000, // auto-refetch every 60s
  });

  const {
    data: chartData,
    isLoading: chartLoading,
  } = useGetDonationChartDataQuery(
    { interval, days: currentOption.days },
    { skip: isPreviewMode, pollingInterval: 60_000 }
  );

  const effectiveStats = isPreviewMode ? MOCK_STATS : stats;
  const effectiveChartData = isPreviewMode ? MOCK_CHART_DATA[interval] : chartData ?? [];
  const isStatsLoading = isPreviewMode ? false : statsLoading;
  const hasStatsError = isPreviewMode ? false : statsError || !effectiveStats;

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPreviewMode && !canAccessAdmin) {
      // Temporary allow any user to view dashboard for testing, but redirect to home if not admin
      router.replace("/");
    }
  }, [isPreviewMode, canAccessAdmin, router]);

  if (!isPreviewMode && !canAccessAdmin) return null;

  // ── Loading state ────────────────────────────────────────────────────────
  if (isStatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  if (hasStatsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black/50">Không thể tải dữ liệu thống kê.</p>
      </div>
    );
  }

  // ── Chart tab content builder ────────────────────────────────────────────
  const buildChartContent = () => (
    <div className="w-full h-[350px]">
      {chartLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={effectiveChartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateVN(v)}
              tick={{ fontSize: 12, fill: "rgba(0,0,0,0.4)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatVNDShort(v)}
              tick={{ fontSize: 12, fill: "rgba(0,0,0,0.4)" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#colorAmount)"
              dot={false}
              activeDot={{ r: 5, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-12">
          <p className="text-black/40 text-sm mb-1 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Quản trị hệ thống
          </p>
          {isPreviewMode && (
            <p className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-2">
              Preview mode (mock data)
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-black">
            <HighlightText variant="underline" color="primary">
              Thống Kê Tổng Quan
            </HighlightText>
          </h1>
        </div>

        {/* ── Section: Dự Án ─────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="font-bold text-black text-xl mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-violet-500" />
            Dự Án
          </h2>
          <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
            <StatCard
              icon={FolderKanban}
              label="Tổng số dự án"
              value={effectiveStats!.totalCampaigns}
              gradient="from-violet-500/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Dự án thành công"
              value={effectiveStats!.successfulCampaigns}
              gradient="from-emerald-500/20"
            />
            <StatCard
              icon={ShieldBan}
              label="Dự án bị tạm ngưng"
              value={effectiveStats!.suspendedCampaigns}
              gradient="from-red-500/20"
            />
          </BentoGrid>
        </div>

        {/* ── Section: Dòng Tiền ─────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="font-bold text-black text-xl mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-500" />
            Dòng Tiền
          </h2>
          <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
            <StatCard
              icon={ArrowDownToLine}
              label="Tổng số tiền đã nhận"
              value={effectiveStats!.totalDonationReceived}
              isCurrency
              gradient="from-rose-500/20"
            />
            <StatCard
              icon={ArrowUpFromLine}
              label="Tổng số tiền đã chi"
              value={effectiveStats!.totalDonationPaid}
              isCurrency
              gradient="from-amber-500/20"
            />
            <StatCard
              icon={Scale}
              label="Số dư Admin đang có"
              value={effectiveStats!.adminBalance}
              isCurrency
              gradient="from-blue-500/20"
            />
          </BentoGrid>
        </div>

        {/* ── Section: Người Dùng ────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="font-bold text-black text-xl mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Người Dùng
          </h2>
          <BentoGrid className="lg:grid-cols-3 auto-rows-auto">
            <StatCard
              icon={UserPen}
              label="Tổng Campaign Creator"
              value={effectiveStats!.totalCampaignCreators}
              gradient="from-violet-500/20"
            />
            <StatCard
              icon={Heart}
              label="Tổng Donor"
              value={effectiveStats!.totalDonors}
              gradient="from-rose-500/20"
            />
            <StatCard
              icon={Users}
              label="Tổng lượng User"
              value={effectiveStats!.totalUsers}
              gradient="from-blue-500/20"
            />
          </BentoGrid>
        </div>

        {/* ── Section: Biểu Đồ Dòng Tiền ────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="font-bold text-black text-xl mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-500" />
            Biểu Đồ Dòng Tiền Quyên Góp
          </h2>

          <VercelTabs
            tabs={INTERVAL_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
              content: buildChartContent(),
            }))}
            defaultTab={interval}
            onTabChange={(v) => setInterval(v as IntervalKey)}
          />
        </div>
      </div>
    </div>
  );
}

