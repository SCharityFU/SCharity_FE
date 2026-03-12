import { CampaignStatus } from "@/dtos";
import type { AdminDonationItem } from "@/lib/store/features/admin/adminApi";

export function formatVND(value: number): string {
  return `${value.toLocaleString("vi-VN")}₫`;
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

export function statusClassName(status: string): string {
  switch (status) {
    case CampaignStatus.PENDING:
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case CampaignStatus.ACTIVE:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case CampaignStatus.CLOSED:
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case CampaignStatus.SUSPENDED:
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case CampaignStatus.COMPLETED:
      return "bg-teal-50 text-teal-700 border border-teal-200";
    case CampaignStatus.WITHDRAWN:
      return "bg-violet-50 text-violet-700 border border-violet-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case CampaignStatus.PENDING:
      return "Đang chờ";
    case CampaignStatus.ACTIVE:
      return "Đang hoạt động";
    case CampaignStatus.CLOSED:
      return "Đã đóng";
    case CampaignStatus.SUSPENDED:
      return "Tạm dừng";
    case CampaignStatus.COMPLETED:
      return "Hoàn thành";
    case CampaignStatus.WITHDRAWN:
      return "Đã rút";
    default:
      return status;
  }
}

export function txStatusLabel(status: AdminDonationItem["status"]): string {
  if (status === "pending") return "Đang chờ";
  if (status === "success") return "Thành công";
  if (status === "failed") return "Thất bại";
  return "Hoàn tiền";
}

export function txStatusClass(status: AdminDonationItem["status"]): string {
  if (status === "success") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (status === "failed") return "bg-red-50 text-red-700 border border-red-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}
