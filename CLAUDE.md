# Architecture (locked)

When you add or change code in this repo, **follow these rules**. They
are not preferences — they are how this template is supposed to work.
Deviating is a bug.

## Scope — what this template IS and ISN'T

**IS**: a thin Next.js frontend that talks to a SEPARATE backend over
HTTP. The backend can be `express-postgres`, `express-supabase`,
`fastapi-supabase`, or anyone else's API — this template doesn't care.

**IS NOT**: a place to put a database. Don't add `lib/db/`, don't
install `pg` / `sequelize` / `prisma`. If you need a database in-process,
use `nextjs-supabase` — it's built for that.

The whole point of this template is the two-repo split. Keep it thin.

## Stack — pinned

| Concern | Choice | Don't substitute |
|---|---|---|
| Data access | **`fetch` via the typed `api()` wrapper in `lib/api.ts`** | No `axios`, no SWR / React Query unless you have a concrete caching need (this template ships without one — RSC + Server Actions cover most patterns). |
| Auth | **httpOnly cookie issued by the backend, forwarded by `api()` and `getUser()`** | Don't add NextAuth / Clerk / `@supabase/ssr`. The backend owns auth. The frontend just round-trips its cookie. |
| Reads (server-side) | **React Server Components calling `api(...)` with `cookies()` forwarded via `getUser()` helper pattern** | Don't fetch in `useEffect` for data known at request time. |
| Writes (forms) | Either `<form>` + Server Action wrapping `api()` (no JS required), OR client `useActionState` + Server Action | Don't `fetch` from the client directly for protected calls — you'd duplicate the cookie-forwarding logic. |
| Validation | Zod inside Server Actions if a field shape gets complex | Skip for length-cap-only fields (`.slice(0, 200)` inline is fine). |
| FontAwesome | **FA Free** (`@fortawesome/free-*-svg-icons`) | No FA Pro `.npmrc` — this template is a public repo, the token would leak. |

## Folder layout — what each layer is for

```
app/
  layout.tsx
  page.tsx              landing
  login/page.tsx        client form -> calls api('/api/auth/login')
  dashboard/page.tsx    SSR auth gate via getUser() (cookie forwarded)
components/
  SignOutButton.tsx     client component (calls api('/api/auth/logout'))
lib/
  api.ts                Typed fetch wrapper. ALWAYS sends cookies
                        (`credentials: 'include'`). Reads
                        NEXT_PUBLIC_API_URL. The ONLY place that
                        knows the backend's base URL.
  auth.ts               getUser() — server-side helper that forwards
                        cookies to `api('/api/auth/me')` and returns
                        the user or null.
next.config.ts          Strict CSP + security headers.
```

There is **no** `lib/db/`, **no** `lib/services/`, **no** ORM models.
That's intentional. The backend owns business logic.

## Mutation pattern — the only canonical shape

```ts
// app/foo/actions.ts
'use server';

import { api } from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const createFoo = async (formData: FormData) => {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Title required' };
  const cookieHeader = (await cookies()).toString();
  try {
    await api('/api/foo', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: JSON.stringify({ title }),
    });
    redirect('/foo');
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err;
    return { error: err instanceof Error ? err.message : 'Request failed' };
  }
};
```

The Server Action takes FormData → calls the backend → redirects (or
returns form state). It doesn't talk to a database, because there
ISN'T one.

## CORS + cookie recipe

Same-origin / shared eTLD+1: backend default `COOKIE_SAMESITE=lax` works.

Cross-origin (frontend on Vercel, backend on Tarrs sandbox):

```
# Backend .env:
COOKIE_SAMESITE=none
CORS_ORIGINS=https://your-app.vercel.app
CSRF_ALLOWED_ORIGINS=https://your-app.vercel.app

# Frontend .env.local:
NEXT_PUBLIC_API_URL=https://your-slug.dev.tarrs.io
```

`sameSite=none` forces `secure=true` (browser requirement). Never serve `none` over plain http.

## What NOT to do

- ❌ Don't install `pg`, `sequelize`, `prisma`, `drizzle`, `@supabase/*`. If you need a DB, change templates.
- ❌ Don't write `app/api/*` route handlers that do business logic — the backend owns that. A route handler here is only justified for: webhooks coming TO the frontend (rare), or proxying to a backend that doesn't accept cross-origin reads.
- ❌ Don't add NextAuth / Clerk — the backend owns auth.
- ❌ Don't fetch from the client for protected data — use RSC with the `getUser()` cookie-forwarding pattern.
- ❌ Don't hardcode the backend URL — read `NEXT_PUBLIC_API_URL` via `lib/api.ts`.
- ❌ Don't bypass `lib/api.ts` — every backend call goes through it (it handles cookie forwarding, base URL, and error shaping).
- ❌ Don't install FA Pro. This is a public template; the token would leak.
- ❌ Don't hand-write a `pnpm-workspace.yaml` / `allowBuilds:` block to silence pnpm's "Ignored build scripts" warning. Native-build approval is already declared in `package.json` → `pnpm.onlyBuiltDependencies` (`sharp`, `unrs-resolver`). If you add another dep with a build script, append its name to that array — don't improvise a workspace file.

## What to do when in doubt

Read `lib/api.ts` + `lib/auth.ts` + `app/dashboard/page.tsx` — they're the canonical example.
