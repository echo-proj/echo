import { AUTH_COOKIE_KEYS, COOKIE_EXPIRY_DAYS } from './constants';

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export const authStorage = {
  getToken(): string | null {
    return getCookie(AUTH_COOKIE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    setCookie(AUTH_COOKIE_KEYS.TOKEN, token, COOKIE_EXPIRY_DAYS);
  },

  removeToken(): void {
    deleteCookie(AUTH_COOKIE_KEYS.TOKEN);
  },

  getUsername(): string | null {
    return getCookie(AUTH_COOKIE_KEYS.USERNAME);
  },

  setUsername(username: string): void {
    setCookie(AUTH_COOKIE_KEYS.USERNAME, username, COOKIE_EXPIRY_DAYS);
  },

  removeUsername(): void {
    deleteCookie(AUTH_COOKIE_KEYS.USERNAME);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  clearAuth(): void {
    this.removeToken();
    this.removeUsername();
  },

  setAuthData(token: string, username: string): void {
    this.setToken(token);
    this.setUsername(username);
  },
};
