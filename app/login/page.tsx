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
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      if (data.session) router.push('/dashboard');
    } catch { setError('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      <div className="auth-card fade-up">
        <h2 style={{ fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,marginBottom:4,color:'var(--dk)' }}>Welcome back 👋</h2>
        <p style={{ fontSize:13,color:'var(--mu)',marginBottom:24 }}>Sign in to continue your prep</p>
        {error && <div style={{ padding:'10px 14px',borderRadius:10,marginBottom:14,background:'var(--rdl)',color:'var(--rd)',fontSize:13,fontWeight:600 }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="fg"><label>Email</label><input type="email" placeholder="you@email.com" value={email} required onChange={e=>setEmail(e.target.value)} /></div>
          <div className="fg"><label>Password</label><input type="password" placeholder="••••••••" value={password} required onChange={e=>setPassword(e.target.value)} /></div>
          <button type="submit" disabled={loading} style={{ width:'100%',padding:12,background:'var(--dk)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:14,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:'pointer',marginTop:6,transition:'all .2s',opacity:loading?.6:1 }}>
            {loading?'Signing in…':'Sign In'}
          </button>
        </form>
        <div style={{ textAlign:'center',marginTop:14,fontSize:12,color:'var(--mu)' }}>
          No account? <Link href="/signup" style={{ color:'var(--pu)',fontWeight:600 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
