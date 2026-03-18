// Single source of truth for VND formatting/parsing across the app.
const VND_CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const VND_GROUPED_FORMATTER = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

const toSafeMoneyNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.round(parsed));
  }

  return 0;
};

export const formatVND = (amount: number): string => {
  return VND_CURRENCY_FORMATTER.format(toSafeMoneyNumber(amount));
};

export const formatVNDInput = (amount: number): string => {
  return VND_GROUPED_FORMATTER.format(toSafeMoneyNumber(amount));
};

export const parseVNDInputToNumber = (raw: string): number => {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return 0;

  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Math.round(parsed));
};
