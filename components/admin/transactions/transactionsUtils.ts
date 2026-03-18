import type { AdminDonationItem } from "@/lib/store/features/admin/adminApi";
import { formatVND } from '@/lib/money';

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusClassName(status: AdminDonationItem["status"]): string {
  if (status === "success") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (status === "failed") return "bg-red-50 text-red-700 border border-red-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export function statusLabel(status: AdminDonationItem["status"]): string {
  if (status === "success") return "Thành công";
  if (status === "pending") return "Đang chờ";
  if (status === "failed") return "Thất bại";
  return "Hoàn tiền";
}
