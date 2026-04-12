'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signup(email, password); router.push('/dashboard'); }
    catch(err:any) { setError(err.message||'Sign up failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'12px 16px', borderRadius:10, background:'#141414', border:'1.5px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, fontFamily:'DM Sans,sans-serif', outline:'none', transition:'border-color .15s' };

  return (
    <div style={{ background:'#0d0d0d', minHeight:'100vh' }}>
      <Navigation />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 58px)', padding:24 }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:28, color:'#fff', marginBottom:6 }}>Create account</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>Start your JEE prep journey</div>
          </div>
          <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'32px 28px' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com"
                  onFocus={e=>(e.target as HTMLInputElement).style.borderColor='rgba(255,210,63,0.5)'}
                  onBlur={e=>(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle} placeholder="Min 6 characters"
                  onFocus={e=>(e.target as HTMLInputElement).style.borderColor='rgba(255,210,63,0.5)'}
                  onBlur={e=>(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              {error && <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(255,82,82,0.1)', border:'1px solid rgba(255,82,82,0.2)', fontSize:13, color:'#FF5252', fontWeight:600 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ padding:'13px', borderRadius:10, background:'#FFD23F', color:'#0d0d0d', fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:800, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, marginTop:4 }}>
                {loading ? 'Creating account…' : 'Get started free →'}
              </button>
            </form>
          </div>
          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
            Already have an account? <Link href="/login" style={{ color:'#FFD23F', fontWeight:700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
