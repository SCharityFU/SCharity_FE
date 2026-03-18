import { WithdrawStatus } from "@/dtos";
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

export function withdrawStatusLabel(status: WithdrawStatus): string {
  if (status === WithdrawStatus.PENDING) return "Đang chờ";
  if (status === WithdrawStatus.APPROVED) return "Đã duyệt";
  if (status === WithdrawStatus.REJECTED) return "Đã từ chối";
  return "Hoàn tất";
}

export function withdrawStatusClassName(status: WithdrawStatus): string {
  if (status === WithdrawStatus.PENDING) {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  if (status === WithdrawStatus.APPROVED) {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }
  if (status === WithdrawStatus.REJECTED) {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}
