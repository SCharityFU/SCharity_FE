import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  XCircle,
} from "lucide-react";
import { CampaignCategory, CampaignRequestStatus } from "@/dtos/enums";

export const STATUS_CONFIG: Record<
  CampaignRequestStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  [CampaignRequestStatus.PENDING]: {
    label: "Đang chờ",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  [CampaignRequestStatus.APPROVED]: {
    label: "Đã duyệt",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
  [CampaignRequestStatus.REJECTED]: {
    label: "Từ chối",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: XCircle,
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  [CampaignCategory.EDUCATION]: "Giáo dục",
  [CampaignCategory.MEDICAL]: "Y tế",
  [CampaignCategory.DISASTER]: "Thiên tai",
  [CampaignCategory.COMMUNITY]: "Cộng đồng",
  [CampaignCategory.ENVIRONMENT]: "Môi trường",
  [CampaignCategory.OTHER]: "Khác",
};

export function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtVND(v: number): string {
  return `${v.toLocaleString("vi-VN")} ₫`;
}
