import { CampaignRequestStatus } from "@/dtos";
import { formatVND } from '@/lib/money';

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

export function requestStatusLabel(status: CampaignRequestStatus): string {
  if (status === CampaignRequestStatus.PENDING) return "Đang chờ";
  if (status === CampaignRequestStatus.APPROVED) return "Đã duyệt";
  return "Đã từ chối";
}

export function requestStatusClassName(status: CampaignRequestStatus): string {
  if (status === CampaignRequestStatus.PENDING) {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  if (status === CampaignRequestStatus.APPROVED) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  return "bg-red-50 text-red-700 border border-red-200";
}
