"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAdminTransactionsQuery,
} from "@/lib/store/features/admin/adminApi";
import { useAppSelector } from "@/lib/store/hooks";
import { UserRole } from "@/dtos";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionsTable } from "@/components/admin/transactions/TransactionsTable";
import { useAnimatedToast } from "@/components/ui/animated-toast";

export default function AdminTransactionsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { addToast } = useAnimatedToast();
  const lastErrorKeyRef = useRef<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const deferredSearch = useDeferredValue(search);
  const debouncedSearch = useDebounce(deferredSearch, 500);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isFetching, isError, error } = useGetAdminTransactionsQuery(
    { page, limit, search: debouncedSearch.trim(), sortOrder },
    { skip: !isAdmin }
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

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

    const message = statusCode
      ? `Không thể tải danh sách giao dịch. Mã lỗi: ${statusCode}`
      : "Không thể tải danh sách giao dịch. Vui lòng thử lại.";
    const errorKey = `${statusCode ?? "unknown"}:${message}`;

    if (lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;

    addToast({
      type: "error",
      title: "Lỗi tải dữ liệu",
      message,
    });
  }, [isError, error, addToast, router]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Giao dịch ủng hộ</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base md:text-lg font-semibold text-black">Danh sách giao dịch ủng hộ</h1>
          <p className="text-xs md:text-sm text-black/50">Quản lý toàn bộ giao dịch quyên góp trên nền tảng.</p>
        </div>
      </div>

      <TransactionsTable
        rows={rows}
        loading={isFetching}
        search={search}
        onSearchChange={setSearch}
        sortOrder={sortOrder}
        onSortOrderChange={(order) => {
          setSortOrder(order);
          setPage(1);
        }}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        totalItems={pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />
    </div>
  );
}
