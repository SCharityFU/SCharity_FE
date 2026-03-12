import { useMemo } from "react";
import { AnimatedTable, ColumnDef, SortDirection } from "@/components/ui/animated-table";
import type { AdminDonationItem } from "@/lib/store/features/admin/adminApi";
import {
  formatDateTime,
  formatVND,
  statusClassName,
  statusLabel,
} from "@/components/admin/transactions/transactionsUtils";

interface TransactionsTableProps {
  rows: AdminDonationItem[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (order: "ASC" | "DESC") => void;
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TransactionsTable({
  rows,
  loading,
  search,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
  page,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: TransactionsTableProps) {
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
        cell: (row) => <span className="text-sm text-black/70 line-clamp-2">{row.message || "-"}</span>,
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

  return (
    <AnimatedTable
      data={rows}
      columns={columns}
      loading={loading}
      searchable
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm theo tên nhà hảo tâm"
      sortColumn="createdAt"
      sortDirection={sortDirection}
      onSort={(columnId, direction) => {
        if (columnId !== "createdAt") return;
        onSortOrderChange(direction === "asc" ? "ASC" : "DESC");
      }}
      pagination={{
        page,
        pageSize: limit,
        totalItems,
        pageSizeOptions: [10, 20, 50, 100],
        onPageChange,
        onPageSizeChange,
      }}
      emptyMessage="Không có giao dịch phù hợp"
    />
  );
}
