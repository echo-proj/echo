import type { NextConfig } from 'next';

const requiredEnv = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL'] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL as string,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL as string,
  },
};

export default nextConfig;
