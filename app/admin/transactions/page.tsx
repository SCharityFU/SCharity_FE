"use client";

import { useMemo, useState } from "react";
import { AnimatedTable, ColumnDef, SortDirection } from "@/components/ui/animated-table";
import {
  AdminDonationItem,
  useGetAdminTransactionsQuery,
} from "@/lib/store/features/admin/adminApi";
import { useAppSelector } from "@/lib/store/hooks";
import { UserRole } from "@/dtos";

function formatVND(value: number): string {
  return `${value.toLocaleString("vi-VN")}₫`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClassName(status: AdminDonationItem["status"]): string {
  if (status === "success") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (status === "failed") return "bg-red-50 text-red-700 border border-red-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function statusLabel(status: AdminDonationItem["status"]): string {
  if (status === "success") return "Thành công";
  if (status === "pending") return "Đang chờ";
  if (status === "failed") return "Thất bại";
  return "Hoàn tiền";
}

export default function AdminTransactionsPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const isAdmin = user?.role === UserRole.ADMIN;

  const { data, isFetching, isError, error } = useGetAdminTransactionsQuery(
    { page, limit, search: search.trim(), sortOrder },
    { skip: !isAdmin }
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = useMemo<ColumnDef<AdminDonationItem>[]>(
    () => [
      {
        id: "donorDisplayName",
        header: "Nhà hảo tâm",
        accessorKey: "donorDisplayName",
      },
      {
        id: "createdAt",
        header: "Thời gian",
        sortable: true,
        cell: (row) => <span className="text-sm text-black/70">{formatDateTime(row.createdAt)}</span>,
      },
      {
        id: "message",
        header: "Lời nhắn",
        cell: (row) => (
          <span className="text-sm text-black/70 line-clamp-2">{row.message || "-"}</span>
        ),
      },
      {
        id: "amount",
        header: "Số tiền",
        align: "right",
        cell: (row) => <span className="font-semibold text-black">{formatVND(row.amount)}</span>,
      },
      {
        id: "bankName",
        header: "Ngân hàng",
        cell: (row) => <span className="text-sm text-black/70">{row.bankName || "-"}</span>,
      },
      {
        id: "bankAccount",
        header: "Tài khoản",
        cell: (row) => <span className="font-mono text-xs text-black/70">{row.bankAccount || "-"}</span>,
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${statusClassName(row.status)}`}>
            {statusLabel(row.status)}
          </span>
        ),
      },
    ],
    []
  );

  const sortDirection: SortDirection = sortOrder === "ASC" ? "asc" : "desc";

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

      <AnimatedTable
        data={rows}
        columns={columns}
        loading={isFetching}
        searchable
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Tìm theo tên nhà hảo tâm"
        sortColumn="createdAt"
        sortDirection={sortDirection}
        onSort={(columnId, direction) => {
          if (columnId !== "createdAt") return;
          const nextOrder = direction === "asc" ? "ASC" : "DESC";
          setSortOrder(nextOrder);
          setPage(1);
        }}
        pagination={{
          page: pagination?.page ?? page,
          pageSize: pagination?.limit ?? limit,
          totalItems: pagination?.total ?? 0,
          pageSizeOptions: [10, 20, 50, 100],
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setLimit(size);
            setPage(1);
          },
        }}
        emptyMessage="Không có giao dịch phù hợp"
      />
    </div>
  );
}
