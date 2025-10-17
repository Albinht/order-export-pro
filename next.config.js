/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization uitschakelen voor Cloudflare
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Webpack configuration to exclude problematic files
  webpack: (config, { isServer }) => {
    // Exclude .md, LICENSE and other non-JS files from being processed
    config.module.rules.push({
      test: /\.(md|txt|LICENSE)$/,
      use: 'null-loader'
    });
    
    // Fix for libsql/client imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@libsql/client': '@libsql/client/web',
    };
    
    return config;
  },
  
  // Headers voor security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
