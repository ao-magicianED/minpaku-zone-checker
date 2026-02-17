import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 日本語パスでのturbopackクラッシュを回避 */
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
