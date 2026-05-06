import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import SignOutButton from '@/components/SignOutButton';

export default async function DashboardPage() {
  const user = await getUser();
  // Server-side gate. The client-side render never starts unless the
  // session cookie was valid at request time, so there's no flash of
  // protected content.
  if (!user) redirect('/login');

  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-2">You&apos;re in</h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          This page is server-rendered against your API. Replace it with
          something useful — list the API resources, drop in a chart, build
          your own. The auth cookie is in place; every <code className="px-1 rounded bg-zinc-100">api()</code>{' '}
          call from <code className="px-1 rounded bg-zinc-100">lib/api.ts</code> will be authenticated.
        </p>
      </section>
    </main>
  );
}
