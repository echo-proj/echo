import { AxiosError } from 'axios';

interface BackendErrorResponse {
  error?: string;
  [key: string]: string | undefined;
}

export function getErrorMessage(error: unknown, fallback: string = 'Something went wrong. Please try again.'): string {
  if (error instanceof AxiosError) {
    const backendError = error.response?.data as BackendErrorResponse | undefined;

    if (backendError?.error) {
      return backendError.error;
    }

    if (backendError && typeof backendError === 'object') {
      const fieldErrors = Object.entries(backendError)
        .filter(([key]) => key !== 'error')
        .map(([_, value]) => value)
        .filter(Boolean);

      if (fieldErrors.length > 0) {
        return fieldErrors.join('. ');
      }
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

export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (error instanceof AxiosError) {
    const backendError = error.response?.data as BackendErrorResponse | undefined;

    if (backendError && typeof backendError === 'object') {
      const errors: Record<string, string> = {};

      for (const [key, value] of Object.entries(backendError)) {
        if (key !== 'error' && value) {
          errors[key] = value;
        }
      }

      return Object.keys(errors).length > 0 ? errors : null;
    }
  }

  return null;
}
