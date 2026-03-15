"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle, Eye } from "lucide-react";
import { AnimatedTable, ColumnDef } from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import type { AdminReportResponseDto } from "@/dtos/admin";
import {
  reportReasonLabel,
  reportStatusLabel,
  reportStatusClassName,
  formatDateTimeVN,
} from "@/components/admin/reports/reportsUtils";
import { ReportStatus } from "@/dtos";

interface ReportsTableProps {
  rows: AdminReportResponseDto[];
  loading: boolean;
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onViewDetail: (report: AdminReportResponseDto) => void;
  onResolve: (reportId: string) => void;
  resolvingId: string | null;
}

export function ReportsTable({
  rows,
  loading,
  page,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
  hasActiveFilters,
  onClearFilters,
  onViewDetail,
  onResolve,
  resolvingId,
}: ReportsTableProps) {
  const columns = useMemo<ColumnDef<AdminReportResponseDto>[]>(
    () => [
      {
        id: "reason",
        header: "Lý do",
        cell: (row) => (
          <span className="font-medium text-black text-sm">
            {reportReasonLabel(row.reason)}
          </span>
        ),
      },
      {
        id: "campaign",
        header: "Chiến dịch",
        cell: (row) =>
          row.campaign ? (
            <Link
              href={`/admin/campaigns/${row.campaign.id}`}
              className="text-sm text-rose-600 hover:underline line-clamp-1"
              onClick={(e) => e.stopPropagation()}
            >
              {row.campaign.title}
            </Link>
          ) : (
            <span className="text-sm text-black/40">-</span>
          ),
      },
      {
        id: "reporter",
        header: "Người báo cáo",
        cell: (row) => (
          <span className="text-sm text-black/70">
            {row.reporter?.fullName || "-"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${reportStatusClassName(row.status)}`}
          >
            {reportStatusLabel(row.status)}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        cell: (row) => (
          <span className="text-sm text-black/70">
            {formatDateTimeVN(row.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onViewDetail(row)}
            >
              <Eye className="w-3.5 h-3.5" />
              Chi tiết
            </Button>
            {row.status === ReportStatus.PENDING && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => onResolve(row.id)}
                disabled={resolvingId === row.id}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {resolvingId === row.id ? "Đang xử lý..." : "Đánh dấu đã xem"}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onViewDetail, onResolve, resolvingId],
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
        pageSizeOptions: [10, 20, 50],
        onPageChange,
        onPageSizeChange,
      }}
      emptyMessage={
        hasActiveFilters ? (
          <div className="space-y-2">
            <p>Không có báo cáo phù hợp.</p>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          "Chưa có báo cáo nào."
        )
      }
    />
  );
}
