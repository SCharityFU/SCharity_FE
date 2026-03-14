"use client";

import { ShieldAlert, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminReportResponseDto } from "@/dtos/admin";
import { ReportStatus } from "@/dtos";
import {
  reportReasonLabel,
  reportStatusLabel,
  reportStatusClassName,
  formatDateTimeVN,
} from "@/components/admin/reports/reportsUtils";
import Link from "next/link";

interface ReportDetailModalProps {
  report: AdminReportResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (reportId: string) => void;
  onSuspendCampaign: (campaignId: string, campaignTitle: string) => void;
  resolving: boolean;
}

export function ReportDetailModal({
  report,
  open,
  onOpenChange,
  onResolve,
  onSuspendCampaign,
  resolving,
}: ReportDetailModalProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết báo cáo</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về báo cáo vi phạm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${reportStatusClassName(report.status)}`}
            >
              {reportStatusLabel(report.status)}
            </span>
            <span className="text-xs text-black/40">
              {formatDateTimeVN(report.createdAt)}
            </span>
          </div>

          {/* Lý do */}
          <div>
            <p className="text-xs font-medium text-black/50 mb-1">Lý do</p>
            <p className="text-sm text-black font-medium">
              {reportReasonLabel(report.reason)}
            </p>
          </div>

          {/* Mô tả */}
          {report.description && (
            <div>
              <p className="text-xs font-medium text-black/50 mb-1">Mô tả</p>
              <p className="text-sm text-black/80 whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          )}

          {/* Bằng chứng */}
          {report.evidenceUrls && report.evidenceUrls.length > 0 && (
            <div>
              <p className="text-xs font-medium text-black/50 mb-1">
                Bằng chứng ({report.evidenceUrls.length} ảnh)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {report.evidenceUrls.map((url, i) => (
                  <a
                    key={`${url}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={url}
                      alt={`Bằng chứng ${i + 1}`}
                      className="w-full h-28 object-cover rounded-lg border border-black/10 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Chiến dịch */}
          {report.campaign && (
            <div>
              <p className="text-xs font-medium text-black/50 mb-1">
                Chiến dịch bị báo cáo
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/campaigns/${report.campaign.id}`}
                  className="text-sm text-rose-600 hover:underline"
                >
                  {report.campaign.title}
                </Link>
                <ExternalLink className="w-3 h-3 text-black/30" />
              </div>
            </div>
          )}

          {/* Người báo cáo */}
          <div>
            <p className="text-xs font-medium text-black/50 mb-1">
              Người báo cáo
            </p>
            <p className="text-sm text-black/80">
              {report.reporter?.fullName || "Không xác định"}{" "}
              {report.reporter?.email && (
                <span className="text-black/40">
                  ({report.reporter.email})
                </span>
              )}
            </p>
          </div>

          {/* Thông tin xử lý */}
          {report.resolvedBy && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-700 mb-1">
                Đã xử lý
              </p>
              <p className="text-sm text-emerald-700">
                Bởi {report.resolvedBy.fullName} vào{" "}
                {formatDateTimeVN(report.resolvedAt)}
              </p>
            </div>
          )}

          {/* Actions */}
          {report.status === ReportStatus.PENDING && (
            <div className="flex items-center gap-2 pt-2 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => onResolve(report.id)}
                disabled={resolving}
              >
                {resolving ? "Đang xử lý..." : "Đánh dấu đã xử lý"}
              </Button>
              {report.campaign && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() =>
                    onSuspendCampaign(
                      report.campaign!.id,
                      report.campaign!.title,
                    )
                  }
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Tạm dừng chiến dịch
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
