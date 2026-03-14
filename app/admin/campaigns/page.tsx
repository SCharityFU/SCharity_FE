"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { UserRole, CampaignStatus } from "@/dtos";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetAdminCampaignsQuery,
} from "@/lib/store/features/admin/adminApi";
import type { AdminCampaignListItemDto } from "@/dtos/admin";
import { CampaignsFilters } from "@/components/admin/campaigns/CampaignsFilters";
import { CampaignsTable } from "@/components/admin/campaigns/CampaignsTable";
import { useAnimatedToast } from "@/components/ui/animated-toast";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export default function AdminCampaignsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { addToast } = useAnimatedToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastErrorKeyRef = useRef<string | null>(null);

  const [page, setPage] = useState(() => parsePositiveInt(searchParams.get("page"), 1));
  const [limit, setLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get("limit"), 10), 100));
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? "all");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");

  const deferredSearch = useDeferredValue(search);
  const debouncedSearch = useDebounce(deferredSearch, 400);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (status !== "all") params.set("status", status);
    if (category.trim()) params.set("category", category.trim());
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, page, limit, debouncedSearch, status, category]);

  const { data, isFetching, isError, error, refetch } = useGetAdminCampaignsQuery(
    {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: status !== "all" ? (status as CampaignStatus) : undefined,
      category: category.trim() || undefined,
    },
    { skip: !isAdmin }
  );

  const latestRowsRef = useRef<AdminCampaignListItemDto[]>([]);
  if (data?.data) {
    latestRowsRef.current = data.data;
  }

  const rows = data?.data ?? latestRowsRef.current;
  const pagination = data?.pagination;

  const hasActiveFilters = Boolean(debouncedSearch.trim() || status !== "all" || category.trim());

  useEffect(() => {
    if (!isError) {
      lastErrorKeyRef.current = null;
      return;
    }

    const statusCode = (error as { status?: number })?.status;
    if (statusCode === 401) {
      router.replace("/login");
      return;
    }

    if (statusCode === 403) {
      return;
    }

    const message = statusCode === 404
      ? "Không tìm thấy endpoint dữ liệu chiến dịch quản trị (404)."
      : "Lỗi hệ thống khi tải danh sách chiến dịch. Vui lòng thử lại.";
    const errorKey = `${statusCode ?? "unknown"}:${message}`;
    if (lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;

    addToast({
      type: "error",
      title: "Lỗi tải danh sách chiến dịch",
      message,
      action: {
        label: "Thử lại",
        onClick: () => {
          void refetch();
        },
      },
    });
  }, [isError, error, router, addToast, refetch]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Quản lý chiến dịch</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  const statusCode = (error as { status?: number })?.status;

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-base md:text-lg font-semibold text-black">Quản lý chiến dịch</h1>
          <p className="text-xs md:text-sm text-black/50">Theo dõi và quản trị các campaign trên toàn nền tảng.</p>
        </div>
      </div>

      <CampaignsFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
      />

      {isError && statusCode === 403 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Bạn không có quyền truy cập dữ liệu chiến dịch quản trị.
        </div>
      )}

      <CampaignsTable
        rows={rows}
        loading={isFetching && rows.length === 0}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        totalItems={pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSearch("");
          setStatus("all");
          setCategory("");
          setPage(1);
        }}
        onViewDetails={(id) => router.push(`/admin/campaigns/${id}`)}
      />

      {isFetching && rows.length > 0 && (
        <p className="text-xs text-black/40">Đang cập nhật dữ liệu...</p>
      )}
    </div>
  );
}
