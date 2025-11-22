import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Production optimizations (swcMinify is enabled by default in Next.js 16)
  compress: true,
  // Allow cross-origin requests in development (for tunneling services like zrok, ngrok, etc.)
  allowedDevOrigins: [
    'nisr9fn986u1.share.zrok.io',
    // Add other tunnel domains as needed (strings only, no regex)
  ],
  // Important for World Mini App - allow iframe embedding
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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
  webpack: (config, { isServer }) => {
    // No special handling needed - MiniKitProvider handles runtime access to window.MiniKit
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Output configuration for Vercel
  // Remove 'standalone' for Vercel deployment (Vercel handles this automatically)
  // output: 'standalone', // Commented out for Vercel
};

export default nextConfig;
