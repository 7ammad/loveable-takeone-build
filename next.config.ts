import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  eslint: {
    // Only lint the app directory during builds
    dirs: ['app'],
  },
  experimental: {
    // Optimize for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Optimize for faster compilation
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Externalize heavy packages for server builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'ioredis': 'commonjs ioredis',
        'bullmq': 'commonjs bullmq',
      });
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

export default withSentryConfig(
  nextConfig,
  {
    // Sentry Webpack plugin options
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    silent: true, // Suppresses source map uploading logs during build
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Sentry SDK options
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring", // Route browser requests to Sentry to circumvent ad-blockers
    sourcemaps: { disable: true }, // Disable source map uploads
    disableLogger: true, // Automatically tree-shake Sentry logger statements
    automaticVercelMonitors: true, // Automatic instrumentation of Vercel Cron Monitors
  }
);
// The current configuration seems to be complete and correctly set up for Sentry integration.
// If there are specific issues or improvements needed, please provide more details.
