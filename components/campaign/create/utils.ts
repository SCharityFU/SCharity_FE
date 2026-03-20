import { formatVNDInput, parseVNDInputToNumber } from '@/lib/money';
import { formatVNDShort } from '@/lib/utils';

export const formatVND = formatVNDInput;

export const parseCurrencyInput = parseVNDInputToNumber;

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateInputValue(d);
}

export function getDateAfterDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, days));
  return toDateInputValue(d);
}

export function formatDateVN(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function normalizeDeadlineToVnIso(deadline: string): string | null {
  if (!deadline) return null;

  // Date picker returns YYYY-MM-DD. Convert to end-of-day in Vietnam timezone.
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }

    // 23:59:59.999 +07:00 === 16:59:59.999Z
    return new Date(Date.UTC(year, month - 1, day, 16, 59, 59, 999)).toISOString();
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function shortVND(n: number): string {
  return formatVNDShort(n);
}

export function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { data?: { message?: string } } | undefined;
  return err?.data?.message || fallback;
}
