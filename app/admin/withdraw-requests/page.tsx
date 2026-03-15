"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAnimatedToast } from "@/components/ui/animated-toast";
import { useAppSelector } from "@/lib/store/hooks";
import { UserRole, WithdrawStatus } from "@/dtos";
import { useGetAdminWithdrawRequestsQuery } from "@/lib/store/features/admin/adminApi";
import { WithdrawRequestsTable } from "@/components/admin/withdraw-requests/WithdrawRequestsTable";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseStatus(value: string | null): WithdrawStatus {
  if (value === WithdrawStatus.APPROVED) return WithdrawStatus.APPROVED;
  if (value === WithdrawStatus.REJECTED) return WithdrawStatus.REJECTED;
  if (value === WithdrawStatus.COMPLETED) return WithdrawStatus.COMPLETED;
  return WithdrawStatus.PENDING;
}

const statusTabs: { value: WithdrawStatus; label: string }[] = [
  { value: WithdrawStatus.PENDING, label: "Đang chờ" },
  { value: WithdrawStatus.APPROVED, label: "Đã duyệt" },
  { value: WithdrawStatus.REJECTED, label: "Đã từ chối" },
  { value: WithdrawStatus.COMPLETED, label: "Hoàn tất" },
];

export default function AdminWithdrawRequestsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  const router = useRouter();
  const { addToast } = useAnimatedToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastErrorKeyRef = useRef<string | null>(null);

  const [page, setPage] = useState(() => parsePositiveInt(searchParams.get("page"), 1));
  const [limit, setLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get("limit"), 10), 100));
  const [status, setStatus] = useState<WithdrawStatus>(() => parseStatus(searchParams.get("status")));

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("status", status);
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, page, limit, status]);

  const { data, isFetching, isError, error, refetch } = useGetAdminWithdrawRequestsQuery(
    { page, limit, status },
    { skip: !isAdmin }
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const statusCode = (error as { status?: number } | undefined)?.status;

  useEffect(() => {
    if (!isError) {
      lastErrorKeyRef.current = null;
      return;
    }

    if (statusCode === 401) {
      router.replace("/login");
      return;
    }

    if (statusCode === 403) {
      return;
    }

    const message = statusCode === 404
      ? "Không tìm thấy endpoint yêu cầu rút tiền (404)."
      : "Lỗi hệ thống khi tải danh sách yêu cầu rút tiền. Vui lòng thử lại.";
    const errorKey = `${statusCode ?? "unknown"}:${message}`;
    if (lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;

    addToast({
      type: "error",
      title: "Lỗi tải danh sách yêu cầu",
      message,
      action: {
        label: "Thử lại",
        onClick: () => {
          void refetch();
        },
      },
    });
  }, [isError, statusCode, router, addToast, refetch]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Duyệt yêu cầu rút tiền</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-black">Duyệt yêu cầu rút tiền</h1>
        <p className="text-xs md:text-sm text-black/50">Xem xét các yêu cầu rút tiền từ người tạo campaign.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === tab.value
                ? "bg-rose-500 text-white"
                : "bg-black/[0.04] text-black/65 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError && statusCode === 403 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Bạn không có quyền duyệt yêu cầu rút tiền.
        </div>
      )}

      <WithdrawRequestsTable
        rows={rows}
        loading={isFetching}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        totalItems={pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        onViewDetail={(id) => {
          router.push(`/admin/withdraw-requests/${id}`);
        }}
      />
    </div>
  );
}
