import { CampaignStatus } from "@/dtos";
import { formatVND } from '@/lib/money';

export { formatVND };

export const ADMIN_CAMPAIGN_STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang chờ", value: CampaignStatus.PENDING },
  { label: "Từ chối", value: CampaignStatus.REJECTED },
  { label: "Đang hoạt động", value: CampaignStatus.ACTIVE },
  { label: "Đã đóng", value: CampaignStatus.CLOSED },
  { label: "Tạm dừng", value: CampaignStatus.SUSPENDED },
  { label: "Hoàn thành", value: CampaignStatus.COMPLETED },
  { label: "Đã rút", value: CampaignStatus.WITHDRAWN },
] as const;

export function formatDateVN(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

export function campaignStatusLabel(status: string): string {
  switch (status) {
    case CampaignStatus.PENDING:
      return "Đang chờ";
    case CampaignStatus.REJECTED:
      return "Từ chối";
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

export function campaignStatusClassName(status: string): string {
  switch (status) {
    case CampaignStatus.PENDING:
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case CampaignStatus.REJECTED:
      return "bg-rose-50 text-rose-700 border border-rose-200";
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
