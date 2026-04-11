'use client';
import { Navigation } from '@/components/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    if (password!==confirm) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length<6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      const { data:{user}, error:err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); return; }
      if (user) {
        await supabase.from('user_profiles').insert({ user_id:user.id, full_name:fullName||email.split('@')[0], is_admin:false });
        setSuccess('Done! Check your email to verify.');
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch { setError('Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight:'calc(100vh - 52px)', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:380, border:'1.5px solid var(--dim)' }}>
          <div style={{ padding:'24px', borderBottom:'1.5px solid var(--dim)' }}>
            <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>CREATE ACCOUNT</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Start cracking JEE</div>
          </div>
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:14 }}>
            {error && <div style={{ padding:'10px 14px', border:'1.5px solid #ff4444', color:'#ff4444', fontSize:13 }}>{error}</div>}
            {success && <div style={{ padding:'10px 14px', border:'1.5px solid var(--lime)', color:'var(--lime)', fontSize:13 }}>✦ {success}</div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Full name', type:'text', ph:'John Doe', val:fullName, set:setFullName, req:false },
                { label:'Email', type:'email', ph:'you@example.com', val:email, set:setEmail, req:true },
                { label:'Password', type:'password', ph:'••••••••', val:password, set:setPassword, req:true },
                { label:'Confirm password', type:'password', ph:'••••••••', val:confirm, set:setConfirm, req:true },
              ].map((f,i) => (
                <div key={i}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted)', marginBottom:6 }}>{f.label}</div>
                  <input type={f.type} placeholder={f.ph} value={f.val} required={f.req} onChange={e=>f.set(e.target.value)} />
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-lime" style={{ marginTop:6, justifyContent:'center', width:'100%' }}>
                {loading ? 'Creating…' : 'Create account →'}
              </button>
            </form>
            <p style={{ fontSize:12, color:'var(--muted)', textAlign:'center' }}>
              Have an account? <Link href="/login" style={{ color:'var(--lime)', fontWeight:700 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
