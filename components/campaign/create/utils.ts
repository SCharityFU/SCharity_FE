import { formatVNDInput, parseVNDInputToNumber } from '@/lib/money';
import { formatVNDShort } from '@/lib/utils';

export const formatVND = formatVNDInput;

export const parseCurrencyInput = parseVNDInputToNumber;

export function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function getDateAfterDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, days));
  return d.toISOString().split("T")[0];
}

export function formatDateVN(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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
