import { useMemo } from "react";
import { Eye } from "lucide-react";
import { AnimatedTable, ColumnDef } from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import type { AdminCampaignListItemDto } from "@/dtos/admin";
import {
  campaignStatusClassName,
  campaignStatusLabel,
  formatDateVN,
  formatVND,
} from "@/components/admin/campaigns/campaignsUtils";

interface CampaignsTableProps {
  rows: AdminCampaignListItemDto[];
  loading: boolean;
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onViewDetails: (campaignId: string) => void;
}

export function CampaignsTable({
  rows,
  loading,
  page,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
  hasActiveFilters,
  onClearFilters,
  onViewDetails,
}: CampaignsTableProps) {
  const columns = useMemo<ColumnDef<AdminCampaignListItemDto>[]>(
    () => [
      {
        id: "title",
        header: "Tên campaign",
        cell: (row) => <span className="font-medium text-black">{row.title}</span>,
      },
      {
        id: "organizer",
        header: "Người tổ chức",
        cell: (row) => <span className="text-sm text-black/70">{row.organizer?.fullName || "-"}</span>,
      },
      {
        id: "progress",
        header: "Tiến trình dự án",
        cell: (row) => (
          <div className="min-w-[180px] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/50">{row.progressPercent.toFixed(1)}%</span>
              <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${campaignStatusClassName(row.status)}`}>
                {campaignStatusLabel(row.status)}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, row.progressPercent))}%` }} />
            </div>
          </div>
        ),
      },
      {
        id: "funding",
        header: "Số tiền gây quỹ / Mục tiêu",
        cell: (row) => (
          <div className="text-sm">
            <p className="font-semibold text-black">{formatVND(row.raisedAmount)}</p>
            <p className="text-black/50">/ {formatVND(row.goalAmount)}</p>
          </div>
        ),
      },
      {
        id: "deadline",
        header: "Hạn chót",
        cell: (row) => <span className="text-sm text-black/70">{formatDateVN(row.deadline)}</span>,
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "right",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onViewDetails(row.viewDetails?.campaignId || row.id)}
          >
            <Eye className="w-3.5 h-3.5" />
            Xem chi tiết
          </Button>
        ),
      },
    ],
    [onViewDetails]
  );

  return (
    <AnimatedTable
      data={rows}
      columns={columns}
      loading={loading}
      searchable={false}
      pagination={{
        page,
        pageSize: limit,
        totalItems,
        pageSizeOptions: [10, 20, 50, 100],
        onPageChange,
        onPageSizeChange,
      }}
      emptyMessage={
        hasActiveFilters
          ? (
            <div className="space-y-2">
              <p>Không có campaign phù hợp.</p>
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )
          : "Chưa có campaign nào."
      }
    />
  );
}
