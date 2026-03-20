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
