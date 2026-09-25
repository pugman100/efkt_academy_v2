import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Google Slides / Docs embeds are framed cross-origin; nothing to configure here,
  // but keep uploads small enough for server actions.
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
};

export default nextConfig;
