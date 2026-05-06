/**
 * Typed fetch wrapper. Always sends cookies (`credentials: 'include'`)
 * so the backend's session cookie travels on every call.
 *
 * Why a wrapper instead of raw fetch in each page:
 *   - Single place to add the API base URL (no scattered env reads).
 *   - Single place to handle 401 → redirect / clear local state.
 *   - One JSON-or-throw shape so callers never have to re-implement
 *     error parsing.
 *
 * Usage:
 *   const { user } = await api<{ user: User | null }>('/api/auth/me');
 *   await api('/api/auth/logout', { method: 'POST' });
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ApiError extends Error {
  status: number;
  body?: unknown;
}

const makeError = (status: number, message: string, body?: unknown): ApiError => {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.body = body;
  return err;
};

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!BASE) {
    throw makeError(0, 'NEXT_PUBLIC_API_URL is not set');
  }
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    // Required for the session cookie to travel cross-site (when
    // frontend and API live on different origins). Backend's CORS
    // allowlist must include this frontend's origin and set
    // `credentials: true` for this to actually land — see the
    // express-postgres template for the matching server config.
    credentials: 'include',
  });
  if (res.status === 204) {
    return undefined as T;
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const msg =
      (json && typeof json === 'object' && 'error' in json
        ? String((json as { error: unknown }).error)
        : null) ?? `Request failed: ${res.status}`;
    throw makeError(res.status, msg, json);
  }
  return json as T;
}
