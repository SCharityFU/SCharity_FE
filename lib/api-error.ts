type ApiErrorPayload = {
  status?: number;
  data?: {
    message?: string;
    errors?: Array<{
      field?: string;
      message?: string;
    }>;
  };
};

export function getSafeApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorPayload | undefined;

  if (apiError?.status === 500) {
    return fallback;
  }

  const validationErrors = apiError?.data?.errors ?? [];
  if (validationErrors.length > 0) {
    const firstDetail = validationErrors.find((item) => item?.message);
    if (firstDetail?.message) {
      const detailMessage = firstDetail.field
        ? `${firstDetail.field}: ${firstDetail.message}`
        : firstDetail.message;

      if (apiError?.data?.message && apiError.data.message.toLowerCase() !== 'validation error') {
        return `${apiError.data.message}: ${detailMessage}`;
      }
      return detailMessage;
    }
  }

  return apiError?.data?.message || fallback;
}
