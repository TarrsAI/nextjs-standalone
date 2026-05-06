import { api } from './api';

export interface User {
  id: string;
  email: string;
}

/**
 * Server-component-safe `getUser`: forwards the incoming request's
 * cookies to the API so SSR / RSC can read the session before the
 * page renders. Returns null when anonymous (the API returns
 * `{ user: null }` rather than 401 for /me).
 *
 * Use from React Server Components only — `next/headers` is not
 * available client-side.
 */
export async function getUser(): Promise<User | null> {
  // Dynamic import keeps `next/headers` out of any client bundle that
  // accidentally imports this module (e.g. tree-shaking misses).
  const { headers, cookies } = await import('next/headers');
  // Reconstruct the Cookie header so the backend's loadSession
  // middleware sees the same cookies the browser sent us. Forward
  // X-Forwarded-For too if you want the API's rate-limit IP buckets
  // to reflect the real client.
  const cookieJar = await cookies();
  const cookieHeader = cookieJar.toString();
  const _ = await headers(); // touch headers() so Next treats this as dynamic

  try {
    const res = await api<{ user: User | null }>('/api/auth/me', {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    return res.user;
  } catch {
    return null;
  }
}
