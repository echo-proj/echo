export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

function toWebSocketURL(url: string): string {
  if (!url) return url;
  if (url.startsWith('https://')) return 'wss://' + url.slice('https://'.length);
  if (url.startsWith('http://')) return 'ws://' + url.slice('http://'.length);
  return url;
}

export const COLLABORATION_WS_URL = toWebSocketURL(process.env.NEXT_PUBLIC_WS_URL as string);
