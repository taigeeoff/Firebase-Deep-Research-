import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {

  // Add rewrite for .well-known path
  async rewrites() {
    return [
      {
        source: '/.well-known/:path*', // Match all paths under .well-known
        destination: '/well-known/:path*', // Rewrite to the corresponding path under /well-known
      },
    ];
  },

  // Enable webpack analyzer in production build
  webpack: (config: WebpackConfig, { isServer }: { isServer: boolean }): WebpackConfig => {
    // Add fallbacks for Node.js modules that are causing issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        'require.extensions': false,
        '@opentelemetry/winston-transport': false,
        '@opentelemetry/exporter-jaeger': false
      }
    };

    // Ignore specific problematic packages in webpack processing
    config.ignoreWarnings = [
      { module: /handlebars/ },
      { module: /@opentelemetry/ }
    ];

    return config;
  },
};

export default nextConfig;
