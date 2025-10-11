/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable server actions with 10MB body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // ✅ Content Security Policy (XSS Protection)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires these
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.moyasar.com https://api.anthropic.com https://api.openai.com https://gate.whapi.cloud https://*.supabase.co wss://*.supabase.co",
              "media-src 'self' https: blob:",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // ✅ Issue #37-40: Additional Security Headers
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;

