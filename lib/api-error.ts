type ApiErrorPayload = {
  status?: number;
  data?: {
    message?: string;
  };
};

export function getSafeApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorPayload | undefined;

  if (apiError?.status === 500) {
    return fallback;
  }

  return apiError?.data?.message || fallback;
}
