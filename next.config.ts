import type { NextConfig } from 'next';

// Security headers — the pragmatic baseline for a Tarrs starter.
//
// Deliberately NO Content-Security-Policy and NO X-Frame-Options here:
//  - The Tarrs workspace previews your app inside an iframe; a CSP
//    `frame-ancestors` / X-Frame-Options header blocks that preview
//    (and any other embed) with a hard-to-debug blank pane.
//  - A strict CSP also silently breaks the first third-party thing you
//    add (an analytics snippet, an API call, a font) with console-only
//    errors. For a starter, that costs more than it protects.
// When your app is production-hardened and you know your origins, add
// a CSP back — and if you want click-jacking protection while staying
// embeddable by the Tarrs preview, use:
//   `frame-ancestors 'self' https://tarrs.io https://*.tarrs.io`
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
