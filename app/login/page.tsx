'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.session) {
        // Hard redirect — ensures middleware sees the new session cookie
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      setError(e.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="neo-auth-root">
      <div className="neo-auth-card fade-up">
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 6 }}>// AUTH</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Welcome back.</h2>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 24, fontWeight: 500 }}>Sign in to continue your prep.</p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#ff4d4d', color: '#fff', border: '3px solid #0a0a0a', marginBottom: 14, fontWeight: 700, fontSize: 13 }}>{error}</div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0a0a0a', marginBottom: 6, fontFamily: 'Space Mono,monospace' }}>EMAIL</label>
            <input type="email" placeholder="you@example.com" value={email} required onChange={e => setEmail(e.target.value)} className="neu-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0a0a0a', marginBottom: 6, fontFamily: 'Space Mono,monospace' }}>PASSWORD</label>
            <input type="password" placeholder="••••••••" value={password} required onChange={e => setPassword(e.target.value)} className="neu-input" />
          </div>
          <button type="submit" disabled={loading} className="neu-btn neu-btn-black"
            style={{ marginTop: 6, justifyContent: 'center', width: '100%', padding: 13, fontSize: 14, opacity: loading ? 0.6 : 1 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid #f5d90a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                SIGNING IN…
              </span>
            ) : 'SIGN IN →'}
          </button>
        </form>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#777', fontWeight: 600 }}>
          No account? <Link href="/signup" style={{ color: '#0a0a0a', fontWeight: 800, textDecoration: 'underline', textDecorationStyle: 'wavy' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
