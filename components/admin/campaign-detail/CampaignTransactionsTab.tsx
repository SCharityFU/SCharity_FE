import { useMemo } from "react";
import { RotateCw } from "lucide-react";
import { AnimatedTable, ColumnDef, SortDirection } from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationMetaDto } from "@/dtos/common";
import type { AdminDonationItem } from "@/lib/store/features/admin/adminApi";
import {
  formatDateTimeVN,
  formatVND,
  txStatusClass,
  txStatusLabel,
} from "@/components/admin/campaign-detail/campaignDetailUtils";

interface CampaignTransactionsTabProps {
  rows: AdminDonationItem[];
  pagination?: PaginationMetaDto;
  page: number;
  limit: number;
  search: string;
  sortBy: "createdAt" | "amount";
  sortOrder: "ASC" | "DESC";
  startDate: string;
  endDate: string;
  hasInvalidDateRange: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: "createdAt" | "amount") => void;
  onSortOrderChange: (value: "ASC" | "DESC") => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function CampaignTransactionsTab({
  rows,
  pagination,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  startDate,
  endDate,
  hasInvalidDateRange,
  isFetching,
  isError,
  onRetry,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onStartDateChange,
  onEndDateChange,
  onPageChange,
  onPageSizeChange,
}: CampaignTransactionsTabProps) {
  const sortDirection: SortDirection = sortOrder === "ASC" ? "asc" : "desc";

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
        cell: (row) => <span className="text-sm text-black/70">{formatDateTimeVN(row.createdAt)}</span>,
      },
      {
        id: "amount",
        header: "Số tiền",
        align: "right",
        sortable: true,
        cell: (row) => <span className="font-semibold text-black">{formatVND(row.amount)}</span>,
      },
      {
        id: "message",
        header: "Lời nhắn",
        cell: (row) => <span className="text-sm text-black/70 line-clamp-2">{row.message || "-"}</span>,
      },
      {
        id: "bank",
        header: "Ngân hàng/TK",
        cell: (row) => (
          <div className="text-xs leading-relaxed text-black/70">
            <p>{row.bankName || "-"}</p>
            <p className="font-mono">{row.bankAccount || "-"}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${txStatusClass(row.status)}`}>
            {txStatusLabel(row.status)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="md:col-span-2">
          <label htmlFor="tx-search" className="sr-only">Tìm theo nhà hảo tâm</label>
          <input
            id="tx-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên nhà hảo tâm"
            className="w-full h-9 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-rose-400"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => onSortByChange(v as "createdAt" | "amount")}>
          <SelectTrigger className="h-9 w-full border-black/10 bg-white">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Theo thời gian</SelectItem>
            <SelectItem value="amount">Theo số tiền</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => onSortOrderChange(v as "ASC" | "DESC")}>
          <SelectTrigger className="h-9 w-full border-black/10 bg-white">
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESC">Giảm dần</SelectItem>
            <SelectItem value="ASC">Tăng dần</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 rounded-md border border-black/10 bg-white px-2 text-xs outline-none focus:border-rose-400"
            title="Từ ngày"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 rounded-md border border-black/10 bg-white px-2 text-xs outline-none focus:border-rose-400"
            title="Đến ngày"
          />
        </div>
      </div>

      {hasInvalidDateRange && (
        <p className="text-xs text-red-600">Khoảng ngày không hợp lệ: Từ ngày phải nhỏ hơn hoặc bằng Đến ngày.</p>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
          <span>Không thể tải giao dịch campaign.</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      <AnimatedTable
        data={rows}
        columns={columns}
        loading={isFetching && rows.length === 0}
        sortColumn={sortBy}
        sortDirection={sortDirection}
        onSort={(columnId, direction) => {
          if (columnId !== "createdAt" && columnId !== "amount") return;
          onSortByChange(columnId as "createdAt" | "amount");
          onSortOrderChange(direction === "asc" ? "ASC" : "DESC");
        }}
        pagination={{
          page: pagination?.page ?? page,
          pageSize: pagination?.limit ?? limit,
          totalItems: pagination?.total ?? 0,
          pageSizeOptions: [10, 20, 50, 100],
          onPageChange,
          onPageSizeChange,
        }}
        emptyMessage={
          search.trim() || startDate || endDate
            ? "Không có giao dịch phù hợp bộ lọc hiện tại."
            : "Chưa có giao dịch nào cho campaign này."
        }
      />

      {isFetching && rows.length > 0 && (
        <p className="text-xs text-black/40">Đang cập nhật giao dịch...</p>
      )}
    </div>
  );
}
