import { useMemo } from "react";
import { Eye } from "lucide-react";
import { AnimatedTable, ColumnDef } from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import type { AdminCampaignRequestItemDto } from "@/dtos/admin";
import {
  formatDateTimeVN,
  formatVND,
  requestStatusClassName,
  requestStatusLabel,
} from "@/components/admin/campaign-requests/campaignRequestsUtils";

interface CampaignRequestsTableProps {
  rows: AdminCampaignRequestItemDto[];
  loading: boolean;
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (id: string) => void;
}

export function CampaignRequestsTable({
  rows,
  loading,
  page,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}: CampaignRequestsTableProps) {
  const columns = useMemo<ColumnDef<AdminCampaignRequestItemDto>[]>(
    () => [
      {
        id: "title",
        header: "Tên campaign",
        cell: (row) => <span className="font-medium text-black">{row.title}</span>,
      },
      {
        id: "requester",
        header: "Người tạo",
        cell: (row) => <span className="text-sm text-black/70">{row.requester?.fullName || "-"}</span>,
      },
      {
        id: "goalAmount",
        header: "Mục tiêu gây quỹ",
        align: "right",
        cell: (row) => <span className="font-semibold text-black">{formatVND(row.goalAmount)}</span>,
      },
      {
        id: "createdAt",
        header: "Thời gian gửi request",
        cell: (row) => <span className="text-sm text-black/70">{formatDateTimeVN(row.createdAt)}</span>,
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${requestStatusClassName(row.status)}`}
          >
            {requestStatusLabel(row.status)}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
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
      emptyMessage="Không có yêu cầu tạo campaign phù hợp"
    />
  );
}
