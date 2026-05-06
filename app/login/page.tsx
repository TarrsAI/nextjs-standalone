'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { api, type ApiError } from '@/lib/api';
import type { User } from '@/lib/auth';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api<{ user: User }>(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // Auth cookie is set by the API; refresh the route so the
      // server-rendered shell picks up the new session.
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-xs text-violet-600 hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'Need an account?' : 'Have one already?'}
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-md border border-zinc-200 text-sm focus:outline-none focus:border-violet-500"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-md border border-zinc-200 text-sm focus:outline-none focus:border-violet-500"
          />
        </label>

        {error && (
          <p className="text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-violet-600 text-white text-sm font-semibold cursor-pointer hover:bg-violet-700 disabled:opacity-50"
        >
          {busy ? '…' : mode === 'login' ? 'Sign in' : 'Create'}
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </button>

        <p className="text-center text-xs text-zinc-500">
          <Link href="/" className="hover:underline">
            ← Back home
          </Link>
        </p>
      </form>
    </main>
  );
}
