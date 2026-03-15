import { useMemo } from "react";
import { Eye } from "lucide-react";
import { AnimatedTable, ColumnDef } from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import type { AdminWithdrawRequestItemDto } from "@/dtos/admin";
import {
  formatDateTimeVN,
  formatVND,
  withdrawStatusClassName,
  withdrawStatusLabel,
} from "@/components/admin/withdraw-requests/withdrawRequestsUtils";

interface WithdrawRequestsTableProps {
  rows: AdminWithdrawRequestItemDto[];
  loading: boolean;
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (id: string) => void;
}

export function WithdrawRequestsTable({
  rows,
  loading,
  page,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}: WithdrawRequestsTableProps) {
  const columns = useMemo<ColumnDef<AdminWithdrawRequestItemDto>[]>(
    () => [
      {
        id: "createdAt",
        header: "Thời gian yêu cầu",
        cell: (row) => <span className="text-sm text-black/70">{formatDateTimeVN(row.createdAt)}</span>,
      },
      {
        id: "requester",
        header: "Người yêu cầu",
        cell: (row) => (
          <div>
            <p className="font-medium text-black">{row.requester?.fullName || "-"}</p>
            <p className="text-xs text-black/55">{row.requester?.email || "-"}</p>
          </div>
        ),
      },
      {
        id: "campaign",
        header: "Chiến dịch",
        cell: (row) => <span className="text-sm text-black/70">{row.campaign?.title || row.campaignId}</span>,
      },
      {
        id: "bank",
        header: "Ngân hàng",
        cell: (row) => (
          <div className="text-sm text-black/70">
            <p>{row.bankInfo.bankName}</p>
            <p className="text-xs text-black/55">{row.bankInfo.accountNumber}</p>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Số tiền",
        align: "right",
        cell: (row) => <span className="font-semibold text-black">{formatVND(row.amount)}</span>,
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${withdrawStatusClassName(row.status)}`}
          >
            {withdrawStatusLabel(row.status)}
          </span>
        ),
      },
      {
        id: "action",
        header: "Thao tác",
        align: "right",
        cell: (row) => (
          <Button variant="outline" size="sm" className="h-8" onClick={() => onViewDetail(row.id)}>
            <Eye className="w-3.5 h-3.5" />
            Xem chi tiết
          </Button>
        ),
      },
    ],
    [onViewDetail]
  );

  return (
    <AnimatedTable
      data={rows}
      columns={columns}
      loading={loading}
      pagination={{
        page,
        pageSize: limit,
        totalItems,
        pageSizeOptions: [10, 20, 50, 100],
        onPageChange,
        onPageSizeChange,
      }}
      emptyMessage="Không có yêu cầu rút tiền phù hợp"
    />
  );
}
