'use client';

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppSelector } from '@/lib/store/hooks';
import {
  AdminDonationItem,
  useGetAdminCampaignAnalyticsQuery,
  useGetAdminCampaignDetailQuery,
  useGetAdminCampaignTransactionsQuery,
} from '@/lib/store/features/admin/adminApi';
import { UserRole, CampaignStatus } from '@/dtos';
import { CampaignDetailHeader } from '@/components/admin/campaign-detail/CampaignDetailHeader';
import { CampaignBasicTab } from '@/components/admin/campaign-detail/CampaignBasicTab';
import { CampaignAnalyticsTab } from '@/components/admin/campaign-detail/CampaignAnalyticsTab';
import { CampaignTransactionsTab } from '@/components/admin/campaign-detail/CampaignTransactionsTab';
import { formatDateVN } from '@/components/admin/campaign-detail/campaignDetailUtils';
import { useAnimatedToast } from '@/components/ui/animated-toast';
import { SuspendCampaignModal } from '@/components/admin/campaigns/SuspendCampaignModal';
import { UnsuspendConfirmDialog } from '@/components/admin/campaigns/UnsuspendConfirmDialog';
import { Button } from '@/components/ui/button';

type TabKey = 'basic' | 'analytics' | 'transactions';

function parsePositiveInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default function AdminCampaignDetailPage() {
  const { user } = useAppSelector((state) => state.auth);
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const router = useRouter();
  const { addToast } = useAnimatedToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailErrorToastRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get('tab');
    return tab === 'analytics' || tab === 'transactions' ? tab : 'basic';
  });
  const [days, setDays] = useState(() => parsePositiveInt(searchParams.get('days'), 7));
  const [analyticsStartDate, setAnalyticsStartDate] = useState(() => searchParams.get('analyticsStartDate') ?? '');
  const [analyticsEndDate, setAnalyticsEndDate] = useState(() => searchParams.get('analyticsEndDate') ?? '');

  const [txPage, setTxPage] = useState(() => parsePositiveInt(searchParams.get('txPage'), 1));
  const [txLimit, setTxLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get('txLimit'), 10), 100));
  const [txSearch, setTxSearch] = useState(() => searchParams.get('txSearch') ?? '');
  const [txSortBy, setTxSortBy] = useState<'createdAt' | 'amount'>(() =>
    searchParams.get('txSortBy') === 'amount' ? 'amount' : 'createdAt',
  );
  const [txSortOrder, setTxSortOrder] = useState<'ASC' | 'DESC'>(() =>
    searchParams.get('txSortOrder') === 'ASC' ? 'ASC' : 'DESC',
  );
  const [startDate, setStartDate] = useState(() => searchParams.get('startDate') ?? '');
  const [endDate, setEndDate] = useState(() => searchParams.get('endDate') ?? '');
  const [analyticsSelectedDate, setAnalyticsSelectedDate] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;
  const deferredTxSearch = useDeferredValue(txSearch);
  const debouncedTxSearch = useDebounce(deferredTxSearch, 400);
  const hasInvalidDateRange = Boolean(
    startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime(),
  );
  const hasInvalidAnalyticsDateRange = Boolean(
    analyticsStartDate &&
    analyticsEndDate &&
    new Date(analyticsStartDate).getTime() > new Date(analyticsEndDate).getTime(),
  );
  const hasPartialAnalyticsDateRange = Boolean(
    (analyticsStartDate && !analyticsEndDate) || (!analyticsStartDate && analyticsEndDate),
  );
  const hasAnalyticsCustomRange = Boolean(analyticsStartDate && analyticsEndDate && !hasInvalidAnalyticsDateRange);

  useEffect(() => {
    setTxPage(1);
  }, [debouncedTxSearch, txSortBy, txSortOrder, startDate, endDate]);

  useEffect(() => {
    const url = new URLSearchParams();
    url.set('tab', activeTab);
    url.set('days', String(days));
    if (analyticsStartDate) url.set('analyticsStartDate', analyticsStartDate);
    if (analyticsEndDate) url.set('analyticsEndDate', analyticsEndDate);
    url.set('txPage', String(txPage));
    url.set('txLimit', String(txLimit));
    if (debouncedTxSearch.trim()) url.set('txSearch', debouncedTxSearch.trim());
    url.set('txSortBy', txSortBy);
    url.set('txSortOrder', txSortOrder);
    if (startDate) url.set('startDate', startDate);
    if (endDate) url.set('endDate', endDate);
    router.replace(`${pathname}?${url.toString()}`);
  }, [
    activeTab,
    days,
    analyticsStartDate,
    analyticsEndDate,
    txPage,
    txLimit,
    debouncedTxSearch,
    txSortBy,
    txSortOrder,
    startDate,
    endDate,
    pathname,
  ]);

  const detailQuery = useGetAdminCampaignDetailQuery(campaignId, { skip: !isAdmin });
  const analyticsQuery = useGetAdminCampaignAnalyticsQuery(
    {
      campaignId,
      days,
      startDate: hasAnalyticsCustomRange ? analyticsStartDate : undefined,
      endDate: hasAnalyticsCustomRange ? analyticsEndDate : undefined,
    },
    {
      skip: !isAdmin || activeTab !== 'analytics' || hasInvalidAnalyticsDateRange || hasPartialAnalyticsDateRange,
    },
  );
  const transactionsQuery = useGetAdminCampaignTransactionsQuery(
    {
      campaignId,
      query: {
        page: txPage,
        limit: txLimit,
        search: debouncedTxSearch.trim() || undefined,
        sortBy: txSortBy,
        sortOrder: txSortOrder,
        startDate: !hasInvalidDateRange && startDate ? startDate : undefined,
        endDate: !hasInvalidDateRange && endDate ? endDate : undefined,
      },
    },
    { skip: !isAdmin || activeTab !== 'transactions' },
  );
  const analyticsDateTransactionsQuery = useGetAdminCampaignTransactionsQuery(
    {
      campaignId,
      query: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        startDate: analyticsSelectedDate || undefined,
        endDate: analyticsSelectedDate || undefined,
      },
    },
    {
      skip: !isAdmin || activeTab !== 'analytics' || !analyticsSelectedDate,
    },
  );

  const txRowsRef = useRef<AdminDonationItem[]>([]);
  if (transactionsQuery.data?.data) {
    txRowsRef.current = transactionsQuery.data.data;
  }

  useEffect(() => {
    if (!detailQuery.isError) {
      detailErrorToastRef.current = null;
      return;
    }

    const statusCode = (detailQuery.error as { status?: number } | undefined)?.status;
    if (statusCode === 401) router.replace('/login');
    if (statusCode === 401 || statusCode === 403 || statusCode === 404) return;

    const message = 'Không thể tải chi tiết chiến dịch.';
    if (detailErrorToastRef.current === message) return;
    detailErrorToastRef.current = message;

    addToast({
      type: 'error',
      title: 'Lỗi tải dữ liệu',
      message,
      action: {
        label: 'Thử lại',
        onClick: () => {
          void detailQuery.refetch();
        },
      },
    });
  }, [detailQuery.isError, detailQuery.error, detailQuery.refetch, addToast, router]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Chi tiết chiến dịch</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  const detailStatusCode = (detailQuery.error as { status?: number } | undefined)?.status;
  const detail = detailQuery.data?.data;
  const analyticsPoints = analyticsQuery.data?.data?.chartData ?? [];
  const analyticsRangeLabel =
    analyticsPoints.length > 0
      ? `${formatDateVN(analyticsPoints[0].date)} - ${formatDateVN(analyticsPoints[analyticsPoints.length - 1].date)}`
      : null;

  // Suspend / Unsuspend modal state
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [unsuspendOpen, setUnsuspendOpen] = useState(false);

  const canSuspend = detail?.status === CampaignStatus.ACTIVE || detail?.status === CampaignStatus.CLOSED;
  const canUnsuspend = detail?.status === CampaignStatus.SUSPENDED;

  if (detailStatusCode === 403) {
    return (
      <div className="p-3 md:p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm">
        Bạn không có quyền truy cập chiến dịch này.
      </div>
    );
  }

  if (detailStatusCode === 404) {
    return (
      <div className="p-4 rounded-lg border border-black/10 bg-white space-y-2">
        <p className="text-base font-semibold text-black">Không tìm thấy chiến dịch.</p>
        <p className="text-sm text-black/55">Campaign có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/admin/campaigns" className="text-sm text-rose-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      <CampaignDetailHeader
        title={detail?.title}
        creatorName={detail?.creator?.fullName}
        publicCampaignId={detail?.publicView?.campaignId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPublicView={(id) => router.push(`/campaigns/${id}`)}
      />

      {detailQuery.isError && detailStatusCode !== 401 && detailStatusCode !== 403 && detailStatusCode !== 404 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Không thể tải chi tiết chiến dịch.
          </span>
          <Button variant="outline" size="sm" onClick={() => detailQuery.refetch()}>
            <RotateCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      {activeTab === 'basic' && detail && <CampaignBasicTab detail={detail} />}

      {/* Suspend / Unsuspend actions */}
      {detail && (
        <div className="flex items-center gap-2">
          {canSuspend && (
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => setSuspendOpen(true)}
            >
              Tạm dừng chiến dịch
            </Button>
          )}
          {canUnsuspend && (
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => setUnsuspendOpen(true)}
            >
              Gỡ tạm dừng
            </Button>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <CampaignAnalyticsTab
          days={days}
          onDaysChange={(value) => {
            setDays(parsePositiveInt(String(value), 30));
            setAnalyticsStartDate('');
            setAnalyticsEndDate('');
          }}
          rangeStartDate={analyticsStartDate}
          rangeEndDate={analyticsEndDate}
          onRangeStartDateChange={setAnalyticsStartDate}
          onRangeEndDateChange={setAnalyticsEndDate}
          onClearDateRange={() => {
            setAnalyticsStartDate('');
            setAnalyticsEndDate('');
          }}
          hasInvalidDateRange={hasInvalidAnalyticsDateRange}
          hasPartialDateRange={hasPartialAnalyticsDateRange}
          activeRangeLabel={analyticsRangeLabel}
          chartData={analyticsPoints}
          isError={analyticsQuery.isError}
          onRetry={() => analyticsQuery.refetch()}
          selectedDate={analyticsSelectedDate}
          onSelectDateFromChart={setAnalyticsSelectedDate}
          onClearSelectedDate={() => setAnalyticsSelectedDate(null)}
          selectedDateDonations={analyticsDateTransactionsQuery.data?.data ?? []}
          isLoadingSelectedDateDonations={analyticsDateTransactionsQuery.isFetching}
          isSelectedDateDonationsError={analyticsDateTransactionsQuery.isError}
          onRetrySelectedDateDonations={() => analyticsDateTransactionsQuery.refetch()}
        />
      )}

      {activeTab === 'transactions' && (
        <CampaignTransactionsTab
          rows={transactionsQuery.data?.data ?? txRowsRef.current}
          pagination={transactionsQuery.data?.pagination}
          page={txPage}
          limit={txLimit}
          search={txSearch}
          sortBy={txSortBy}
          sortOrder={txSortOrder}
          startDate={startDate}
          endDate={endDate}
          hasInvalidDateRange={hasInvalidDateRange}
          isFetching={transactionsQuery.isFetching}
          isError={transactionsQuery.isError}
          onRetry={() => transactionsQuery.refetch()}
          onSearchChange={setTxSearch}
          onSortByChange={setTxSortBy}
          onSortOrderChange={setTxSortOrder}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onPageChange={setTxPage}
          onPageSizeChange={(size) => {
            setTxLimit(size);
            setTxPage(1);
          }}
        />
      )}

      <SuspendCampaignModal
        campaignId={campaignId}
        campaignTitle={detail?.title ?? ''}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />

      <UnsuspendConfirmDialog
        campaignId={campaignId}
        campaignTitle={detail?.title ?? ''}
        open={unsuspendOpen}
        onOpenChange={setUnsuspendOpen}
      />
    </div>
  );
}
