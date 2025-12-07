import { AxiosError } from 'axios';

interface BackendErrorResponse {
  error: string;
}

export function getErrorMessage(error: unknown, fallback: string = 'Something went wrong. Please try again.'): string {
  if (error instanceof AxiosError) {
    const backendError = error.response?.data as BackendErrorResponse | undefined;
    if (backendError?.error) {
      return backendError.error;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
