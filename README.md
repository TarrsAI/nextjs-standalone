# Next.js standalone frontend

A pure Next.js 15 frontend wired to a separate API backend (no
in-process database, no `app/api/*` routes). Pair with
`express-postgres` or `express-supabase` and you've got a clean
two-repo split:

- This repo → deployed to Vercel
- Backend repo → deployed to Tarrs sandbox at `<slug>.dev.tarrs.io`
- Frontend reads `NEXT_PUBLIC_API_URL` and calls the backend with
  cookie credentials

## What's included

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind 4 + Font Awesome
- Strict CSP + standard security headers (next.config.ts)
- Typed `api()` fetch wrapper that always sends cookies (`credentials: 'include'`)
- Server-side `getUser()` for RSC-safe auth checks (forwards cookies)
- Login/register page with mode toggle
- Dashboard page gated server-side via `redirect('/login')`

No database client, no auth library — the backend owns all of that.
This frontend is intentionally thin.

## How Tarrs uses this

In a multi-repo project (frontend + backend + db):

- Tarrs picks `nextjs-standalone` for the **frontend** repo
- Tarrs picks `express-postgres` (or `express-supabase`) for the **backend** repo
- This frontend deploys to Vercel
- The backend runs in the Tarrs sandbox
- Tarrs sets `NEXT_PUBLIC_API_URL` to the backend's sandbox URL

## Local dev

```bash
pnpm install
cp .env.example .env.local
# point NEXT_PUBLIC_API_URL at your dev backend
pnpm dev   # http://localhost:3000
```

If your backend is running on `:3000` too (the express-postgres
default), change one of them — Next.js dev server and the API can't
share a port. Either run Next on `:3001` (`next dev -p 3001`) or set
the API's `PORT=4000`.

## Cookie + CORS recipe

For the session cookie to work cross-origin (frontend on
`acme.vercel.app`, API on `acme.dev.tarrs.io`):

- API: `COOKIE_SAMESITE=none` + `CORS_ORIGINS=https://acme.vercel.app`
- Frontend: just call `api('/api/...')` — `credentials: 'include'` is
  already set by the wrapper

For same-origin or shared-eTLD+1 setups, the API's default
`COOKIE_SAMESITE=lax` is fine.

## Adding a new API call

1. Add the typed wrapper in your component:

   ```ts
   import { api } from '@/lib/api';
   const { posts } = await api<{ posts: Post[] }>('/api/posts');
   ```

2. From an RSC, the wrapper works server-side too — but you need to
   forward the request cookies (see `lib/auth.ts:getUser` for the
   pattern).
