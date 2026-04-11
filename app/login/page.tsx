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
      const { data, error:err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      if (data.session) router.push('/dashboard');
    } catch { setError('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight:'calc(100vh - 52px)', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:380, border:'1.5px solid var(--dim)' }}>
          <div style={{ padding:'24px', borderBottom:'1.5px solid var(--dim)' }}>
            <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>SIGN IN</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Continue your prep</div>
          </div>
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:14 }}>
            {error && <div style={{ padding:'10px 14px', border:'1.5px solid #ff4444', color:'#ff4444', fontSize:13 }}>{error}</div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted)', marginBottom:6 }}>Email</div>
                <input type="email" placeholder="you@example.com" value={email} required onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted)', marginBottom:6 }}>Password</div>
                <input type="password" placeholder="••••••••" value={password} required onChange={e=>setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-lime" style={{ marginTop:6, justifyContent:'center', width:'100%' }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
            <p style={{ fontSize:12, color:'var(--muted)', textAlign:'center' }}>
              No account? <Link href="/signup" style={{ color:'var(--lime)', fontWeight:700 }}>Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
