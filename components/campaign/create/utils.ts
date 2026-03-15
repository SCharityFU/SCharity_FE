export function formatVND(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function parseCurrencyInput(raw: string): number {
  return Number(raw.replace(/\./g, "").replace(/\D/g, "")) || 0;
}

export function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function formatDateVN(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function shortVND(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
  return formatVND(n);
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
