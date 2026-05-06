'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api('/api/auth/logout', { method: 'POST' });
        } finally {
          // Always navigate, even if the API call failed — the server
          // will redirect to /login on the next request when it sees
          // no cookie. Beats getting stuck on a stale dashboard.
          router.push('/');
          router.refresh();
        }
      }}
      className="text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer disabled:opacity-50"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
