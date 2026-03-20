import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CampaignCategory } from "@/dtos/enums"
import { formatVND as formatVNDCurrency } from "@/lib/money"

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDateValue = (value: string): Date => {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  return new Date(value);
};

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
  return formatVNDCurrency(amount);
}

/**
 * Format a date string as dd/mm/yyyy.
 */
export function formatDateVN(iso: string): string {
  const d = parseDateValue(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { timeZone: VIETNAM_TIME_ZONE });
}


export const mapCategoryToVietnamese = (category: string) => {
  switch (category) {
    case CampaignCategory.DAVA:
      return "Nạn Nhân Da Cam";
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

export const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: VIETNAM_TIME_ZONE,
  }).format(
    parseDateValue(dateStr),
  );

export const formatDateOnly = (dateStr: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: VIETNAM_TIME_ZONE }).format(
    parseDateValue(dateStr),
  );

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const toSafeNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const parseNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const resolveCampaignProgressPercent = ({
  progressPercent,
  raisedAmount,
  goalAmount,
}: {
  progressPercent?: number | string | null;
  raisedAmount?: number | string | null;
  goalAmount?: number | string | null;
}) => {
  const raised = Math.max(0, toSafeNumber(raisedAmount));
  const goal = Math.max(0, toSafeNumber(goalAmount));
  const fallbackPercent = goal > 0 ? (raised / goal) * 100 : 0;
  const rawProgress = parseNullableNumber(progressPercent);

  if (rawProgress === null) {
    return clampPercent(fallbackPercent);
  }

  const direct = clampPercent(rawProgress);
  const scaled = clampPercent(rawProgress * 100);

  if (goal > 0) {
    const directDiff = Math.abs(direct - fallbackPercent);
    const scaledDiff = Math.abs(scaled - fallbackPercent);
    return scaledDiff + 0.05 < directDiff ? scaled : direct;
  }

  if (Math.abs(rawProgress) <= 1) {
    return scaled;
  }

  return direct;
};

export const formatCampaignProgressPercent = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  if (value >= 100) return "100%";
  if (value < 1) return `${value.toFixed(2)}%`;
  if (value < 10) return `${value.toFixed(1)}%`;
  return `${value.toFixed(0)}%`;
};

export const formatAmountByMagnitude = (amount: number | string | null | undefined) => {
  const safe = toSafeNumber(amount);
  const abs = Math.abs(safe);

  let divisor = 1;
  let unit = "";
  let decimals = 0;

  if (abs >= 1_000_000_000) {
    divisor = 1_000_000_000;
    unit = " tỷ";
    decimals = abs < 10_000_000_000 ? 1 : 0;
  } else if (abs >= 1_000_000) {
    divisor = 1_000_000;
    unit = " tr";
    decimals = abs < 10_000_000 ? 2 : 1;
  } else if (abs >= 1_000) {
    divisor = 1_000;
    unit = "k";
    decimals = abs < 100_000 ? 1 : 0;
  }

  const value = safe / divisor;
  const rounded = Number(value.toFixed(decimals));
  const formatted = `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: decimals,
  }).format(rounded)}${unit}`;

  return {
    value: rounded,
    unit,
    decimals,
    formatted,
  };
};
