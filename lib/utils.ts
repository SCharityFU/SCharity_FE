import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CampaignCategory } from "@/dtos/enums"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as short VND currency.
 * e.g. 1500000 → "1,5 tr" | 2000000000 → "2 tỷ"
 */
export function formatVNDShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return (Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(".", ",")) + " tỷ";
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return (Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(".", ",")) + " tr";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Format a date string as dd/mm/yyyy.
 */
export function formatDateVN(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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
