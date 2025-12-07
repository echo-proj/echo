import { AxiosError } from 'axios';
import {clsx, type ClassValue} from "clsx"

import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

interface BackendErrorResponse {
    error?: string;
    [key: string]: string | undefined;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
    if (!(error instanceof AxiosError)) return fallback;

    const data = error.response?.data as BackendErrorResponse | undefined;
    return data?.error || error.message || fallback;
}

export function getValidationErrors(error: unknown): Record<string, string> | null {
    if (!(error instanceof AxiosError)) return null;

    const data = error.response?.data as BackendErrorResponse | undefined;
    if (!data) return null;

    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
        if (key !== 'error' && value) {
            errors[key] = value;
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
}
