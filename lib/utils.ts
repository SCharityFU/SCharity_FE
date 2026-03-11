import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CampaignCategory } from "@/dtos/enums"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mapCategoryToVietnamese = (category: string) => {
  switch (category) {
    case CampaignCategory.EDUCATION:
      return "Giáo Dục";
    case CampaignCategory.MEDICAL:
      return "Y Tế";
    case CampaignCategory.ENVIRONMENT:
      return "Môi Trường";
    case CampaignCategory.DISASTER:
      return "Cứu Trợ";
    case CampaignCategory.COMMUNITY:
      return "Xã Hội";
    default:
      return "Khác";
  }
};

export const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(dateStr),
  );

export const formatDateOnly = (dateStr: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(dateStr));
