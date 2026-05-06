import type { NextConfig } from 'next';

// Strict security headers + CSP. The connect-src allowlist depends on
// where your API lives — defaults to the same origin plus
// NEXT_PUBLIC_API_URL. Add other endpoints (analytics, third-party
// APIs) to the list as you wire them up.
const isDev = process.env.NODE_ENV !== 'production';
const apiOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? '';
  try {
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
})();

const csp = [
  `default-src 'self'`,
  `script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${apiOrigin}`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
]
  .filter(Boolean)
  .join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
