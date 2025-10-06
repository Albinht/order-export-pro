/** @type {import('next').NextConfig} */
const nextConfig = {
  // Voor Cloudflare Pages
  experimental: {
    runtime: 'nodejs', // We gebruiken @cloudflare/next-on-pages adapter
  },
  
  // Optimalisaties voor edge
  swcMinify: true,
  
  // Image optimization uitschakelen voor Cloudflare
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
