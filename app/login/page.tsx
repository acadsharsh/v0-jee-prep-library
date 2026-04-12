'use client';
import { Navigation } from '@/components/navigation';
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
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      if (data.session) router.push('/dashboard');
    } catch { setError('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main className="dash-root" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', borderRadius: 24, overflow: 'hidden', border: '1.5px solid #E8EAF0', boxShadow: '0 20px 60px rgba(0,0,0,0.07)' }}>
          <div style={{ padding: '32px 32px 24px', background: '#EDE9FE', borderBottom: '1px solid #E8EAF0' }}>
            <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 26, color: '#1A1A2E', marginBottom: 4 }}>Welcome back! 👋</div>
            <div style={{ fontSize: 14, color: '#7C3AED', fontWeight: 700 }}>Sign in to continue your prep</div>
          </div>
          <div style={{ padding: '28px 32px' }}>
            {error && <div style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 16, background: '#FEE2E2', color: '#EF4444', fontSize: 13, fontWeight: 800 }}>{error}</div>}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ label: 'Email', type: 'email', ph: 'you@example.com', val: email, set: setEmail }, { label: 'Password', type: 'password', ph: '••••••••', val: password, set: setPassword }].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7C8DB0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                  <input type={f.type} placeholder={f.ph} value={f.val} required onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-dash-primary" style={{ marginTop: 6, justifyContent: 'center', width: '100%', padding: '13px', fontSize: 15, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
            <p style={{ fontSize: 13, color: '#7C8DB0', textAlign: 'center', marginTop: 20, fontWeight: 700 }}>
              No account? <Link href="/signup" style={{ color: '#7C3AED', fontWeight: 900 }}>Create one free</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
