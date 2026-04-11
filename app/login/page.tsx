'use client';

import { Navigation } from '@/components/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      if (data.session) router.push('/dashboard');
    } catch { setError('Login failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: 'calc(100vh - 48px)', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="fade-in" style={{
          width: '100%', maxWidth: 380,
          background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 4 }}>Sign in</div>
            <div style={{ fontSize: 13, color: 'var(--tx-3)' }}>Continue your JEE prep</div>
          </div>

          <div style={{ padding: 24 }}>
            {error && (
              <div style={{ padding: '9px 12px', borderRadius: 5, marginBottom: 14, background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 12.5 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>Email</label>
                <input type="email" placeholder="you@example.com" value={email} required
                  onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>Password</label>
                <input type="password" placeholder="••••••••" value={password} required
                  onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
              </div>
              <button type="submit" disabled={isLoading} className="btn-acc"
                style={{ marginTop: 6, justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
                {isLoading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={13} /></>}
              </button>
            </form>
            <p style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 16, textAlign: 'center' }}>
              No account?{' '}
              <Link href="/signup" style={{ color: 'var(--acc)', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
