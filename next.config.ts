import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling these into the main server chunk.
  // They are only needed in /api/export-pdf and are already dynamically
  // imported there — marking them external keeps every other route's
  // cold-start unaffected by the ~50 MB Chromium binary.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

export default nextConfig;
