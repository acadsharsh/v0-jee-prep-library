'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.session) window.location.href = '/dashboard';
    } catch (e: any) { setError(e.message || 'Login failed'); setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--yellow)', letterSpacing: 1, marginBottom: 6 }}>JEEPREP</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Sign in to continue your prep</div>
        </div>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--r-md)', marginBottom: 16, color: 'var(--coral)', fontSize: 13, fontWeight: 500 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Email</label><input type="email" className="field-input" placeholder="you@example.com" value={email} required onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="field-label">Password</label><input type="password" className="field-input" placeholder="••••••••" value={password} required onChange={e => setPassword(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, justifyContent: 'center', padding: '12px', fontSize: 14, opacity: loading ? 0.6 : 1 }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Signing in…</span> : 'Sign in →'}
          </button>
        </form>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
          No account? <Link href="/signup" style={{ color: 'var(--yellow)', fontWeight: 600 }}>Create one free</Link>
        </div>
      </div>
    </div>
  );
}
