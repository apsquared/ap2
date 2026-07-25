'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Full navigation so middleware re-runs with the new cookie.
        window.location.assign(next.startsWith('/admin') ? next : '/admin');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Login failed.');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-24">
      <div className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 font-medium">
        Admin
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        <span className="gradient-text">Task Tracker</span> login
      </h1>
      <p className="mt-2 text-muted text-sm">Enter the shared admin password to continue.</p>

      <form onSubmit={onSubmit} className="glass rounded-2xl border-soft p-6 mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm text-muted mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-soft bg-black/20 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading || !password} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 sm:px-6 py-24 text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
