import { ReportReason, ReportStatus } from "@/dtos";

export const ADMIN_REPORT_STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang chờ", value: ReportStatus.PENDING },
  { label: "Đã xử lý", value: ReportStatus.RESOLVED },
] as const;

export function reportReasonLabel(reason: string): string {
  switch (reason) {
    case ReportReason.FALSE_INFORMATION:
      return "Thông tin sai sự thật";
    case ReportReason.FAKE_IMAGE:
      return "Hình ảnh giả mạo";
    case ReportReason.NO_UPDATE:
      return "Không cập nhật tiến độ";
    case ReportReason.FRAUD:
      return "Lừa đảo";
    case ReportReason.OTHER:
      return "Khác";
    default:
      return reason;
  }
}

export function reportStatusLabel(status: string): string {
  switch (status) {
    case ReportStatus.PENDING:
      return "Đang chờ";
    case ReportStatus.REVIEWED:
      return "Đã xem xét";
    case ReportStatus.RESOLVED:
      return "Đã xử lý";
    default:
      return status;
  }
}

export function reportStatusClassName(status: string): string {
  switch (status) {
    case ReportStatus.PENDING:
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case ReportStatus.REVIEWED:
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case ReportStatus.RESOLVED:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

export function formatDateTimeVN(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
