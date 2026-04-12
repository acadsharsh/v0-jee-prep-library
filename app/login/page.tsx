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
      <main style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 400, background: '#ffffff', borderRadius: 24, overflow: 'hidden', border: '1px solid #e8e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #e8e8f0', background: '#ede9fe' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1e1e2d', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>Welcome back 👋</div>
            <div style={{ fontSize: 14, color: '#7b6cf6', fontWeight: 700 }}>Sign in to continue your prep</div>
          </div>
          <div style={{ padding: '28px 32px' }}>
            {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: '#fee2e2', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>{error}</div>}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Email', type: 'email', ph: 'you@example.com', val: email, set: setEmail },
                { label: 'Password', type: 'password', ph: '••••••••', val: password, set: setPassword },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                  <input type={f.type} placeholder={f.ph} value={f.val} required onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6, justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={15} /></>}
              </button>
            </form>
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 20, fontWeight: 700 }}>
              No account?{' '}<Link href="/signup" style={{ color: '#7b6cf6', fontWeight: 800 }}>Create one free</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
