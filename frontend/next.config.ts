import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Allow cross-origin requests in development (for tunneling services like zrok, ngrok, etc.)
  allowedDevOrigins: [
    'nisr9fn986u1.share.zrok.io',
    // Add other tunnel domains as needed (strings only, no regex)
  ],
  // Important for World Mini App
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  // Empty config silences the warning - MiniKit exclusion handled via webpack fallback
  turbopack: {},
  // Webpack config for MiniKit handling
  // MiniKitProvider is a React component that should be bundled normally
  // It accesses window.MiniKit at runtime (injected by World App)
  webpack: (config) => {
    // No special handling needed - MiniKitProvider handles runtime access to window.MiniKit
    return config;
  },
};

export default nextConfig;
