import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages requires a static export. Supabase will be called
  // directly from the browser using the public anon key + RLS policies,
  // so we don't need Next.js API routes.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
