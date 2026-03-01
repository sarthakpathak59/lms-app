type MaybeError = {
  message?: string;
  error?: string;
  data?: { message?: string; error?: string };
  response?: { data?: { message?: string; error?: string } };
};

export const getErrorMessage = (
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  const error = err as MaybeError;

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    error?.error ||
    fallback
  );
};

export const isNetworkError = (err: unknown): boolean => {
  const error = err as { code?: string; message?: string };

  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('offline') ||
    false
  );
};
