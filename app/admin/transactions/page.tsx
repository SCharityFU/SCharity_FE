"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  useGetAdminTransactionsQuery,
} from "@/lib/store/features/admin/adminApi";
import { useAppSelector } from "@/lib/store/hooks";
import { UserRole } from "@/dtos";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionsTable } from "@/components/admin/transactions/TransactionsTable";

export default function AdminTransactionsPage() {
  const { user } = useAppSelector((state) => state.auth);

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

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Không thể tải danh sách giao dịch. {(error as { status?: number })?.status ? `Mã lỗi: ${(error as { status?: number }).status}` : "Vui lòng thử lại."}
        </div>
      )}

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
