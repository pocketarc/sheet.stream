import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    reactStrictMode: false,
    transpilePackages: ["@sheet-stream/shared"],
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
