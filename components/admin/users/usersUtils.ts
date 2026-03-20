export const ADMIN_USER_EMAIL_VERIFIED_OPTIONS = [
  { value: 'all', label: 'Tất cả email' },
  { value: 'true', label: 'Đã xác thực email' },
  { value: 'false', label: 'Chưa xác thực email' },
] as const;

export function emailVerifiedBadgeClassName(value: boolean): string {
  if (value) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

export function emailVerifiedLabel(value: boolean): string {
  return value ? 'Đã xác thực' : 'Chưa xác thực';
}

export function formatAdminUserDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
