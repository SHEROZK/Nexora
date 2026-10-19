import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Photos uploaded in the admin panel are served from Supabase Storage.
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/media/**`)] : [],
  },
  // Lets the dev server be opened as http://127.0.0.1:3000 as well as http://localhost:3000.
  allowedDevOrigins: [
  "127.0.0.1",
  "*.trycloudflare.com",
],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
