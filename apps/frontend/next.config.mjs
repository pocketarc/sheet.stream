import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
    output: "export",
    reactStrictMode: false,
    transpilePackages: ["@sheet-stream/shared"],
    images: {
        unoptimized: true
    }
};

let exports = nextConfig;

if (process.env["NEXT_PUBLIC_SENTRY_DSN"]) {
    exports = withSentryConfig(
        exports,
        {
            silent: true,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            widenClientFileUpload: true,
            hideSourceMaps: true,
            disableLogger: true
        }
    );
}

export default exports;
