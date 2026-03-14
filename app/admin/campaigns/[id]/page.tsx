"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppSelector } from "@/lib/store/hooks";
import {
  AdminDonationItem,
  useGetAdminCampaignAnalyticsQuery,
  useGetAdminCampaignDetailQuery,
  useGetAdminCampaignTransactionsQuery,
} from "@/lib/store/features/admin/adminApi";
import { UserRole } from "@/dtos";
import { CampaignDetailHeader } from "@/components/admin/campaign-detail/CampaignDetailHeader";
import { CampaignBasicTab } from "@/components/admin/campaign-detail/CampaignBasicTab";
import { CampaignAnalyticsTab } from "@/components/admin/campaign-detail/CampaignAnalyticsTab";
import { CampaignTransactionsTab } from "@/components/admin/campaign-detail/CampaignTransactionsTab";
import { useAnimatedToast } from "@/components/ui/animated-toast";

type TabKey = "basic" | "analytics" | "transactions";

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
    const tab = searchParams.get("tab");
    return tab === "analytics" || tab === "transactions" ? tab : "basic";
  });
  const [days, setDays] = useState(() => parsePositiveInt(searchParams.get("days"), 30));

  const [txPage, setTxPage] = useState(() => parsePositiveInt(searchParams.get("txPage"), 1));
  const [txLimit, setTxLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get("txLimit"), 10), 100));
  const [txSearch, setTxSearch] = useState(() => searchParams.get("txSearch") ?? "");
  const [txSortBy, setTxSortBy] = useState<"createdAt" | "amount">(
    () => (searchParams.get("txSortBy") === "amount" ? "amount" : "createdAt")
  );
  const [txSortOrder, setTxSortOrder] = useState<"ASC" | "DESC">(
    () => (searchParams.get("txSortOrder") === "ASC" ? "ASC" : "DESC")
  );
  const [startDate, setStartDate] = useState(() => searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") ?? "");

  const isAdmin = user?.role === UserRole.ADMIN;
  const deferredTxSearch = useDeferredValue(txSearch);
  const debouncedTxSearch = useDebounce(deferredTxSearch, 400);
  const hasInvalidDateRange = Boolean(startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime());

  useEffect(() => {
    setTxPage(1);
  }, [debouncedTxSearch, txSortBy, txSortOrder, startDate, endDate]);

  useEffect(() => {
    const url = new URLSearchParams();
    url.set("tab", activeTab);
    url.set("days", String(days));
    url.set("txPage", String(txPage));
    url.set("txLimit", String(txLimit));
    if (debouncedTxSearch.trim()) url.set("txSearch", debouncedTxSearch.trim());
    url.set("txSortBy", txSortBy);
    url.set("txSortOrder", txSortOrder);
    if (startDate) url.set("startDate", startDate);
    if (endDate) url.set("endDate", endDate);
    router.replace(`${pathname}?${url.toString()}`);
  }, [router, pathname, activeTab, days, txPage, txLimit, debouncedTxSearch, txSortBy, txSortOrder, startDate, endDate]);

  const detailQuery = useGetAdminCampaignDetailQuery(campaignId, { skip: !isAdmin });
  const analyticsQuery = useGetAdminCampaignAnalyticsQuery(
    { campaignId, days },
    { skip: !isAdmin || activeTab !== "analytics" }
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
    { skip: !isAdmin || activeTab !== "transactions" }
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
    if (statusCode === 401) router.replace("/login");
    if (statusCode === 401 || statusCode === 403 || statusCode === 404) return;

    const message = "Không thể tải chi tiết chiến dịch.";
    if (detailErrorToastRef.current === message) return;
    detailErrorToastRef.current = message;

    addToast({
      type: "error",
      title: "Lỗi tải dữ liệu",
      message,
      action: {
        label: "Thử lại",
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

      {activeTab === "basic" && detail && <CampaignBasicTab detail={detail} />}

      {activeTab === "analytics" && (
        <CampaignAnalyticsTab
          days={days}
          onDaysChange={(value) => setDays(parsePositiveInt(String(value), 30))}
          chartData={analyticsQuery.data?.data?.chartData ?? []}
          isError={analyticsQuery.isError}
          onRetry={() => analyticsQuery.refetch()}
        />
      )}

      {activeTab === "transactions" && (
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
    </div>
  );
}
