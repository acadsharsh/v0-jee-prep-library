'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

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
    if (password!==confirm){setError('Passwords do not match');setLoading(false);return;}
    if (password.length<6){setError('Min 6 characters');setLoading(false);return;}
    try {
      const {data:{user},error:err}=await supabase.auth.signUp({email,password});
      if(err){setError(err.message);return;}
      if(user){
        await supabase.from('profiles').insert({id:user.id,username:fullName||email.split('@')[0],role:'user'});
        setSuccess('Done! Check email to verify.');
        setTimeout(()=>router.push('/login'),2500);
      }
    } catch{setError('Signup failed');}
    finally{setLoading(false);}
  };

  return (
    <div className="auth-root">
      <div className="auth-card fade-up">
        <h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,marginBottom:4,color:'var(--dk)'}}>Get started 🚀</h2>
        <p style={{fontSize:13,color:'var(--mu)',marginBottom:24}}>Create your free JEEPrep account</p>
        {error&&<div style={{padding:'10px 14px',borderRadius:10,marginBottom:14,background:'var(--rdl)',color:'var(--rd)',fontSize:13,fontWeight:600}}>{error}</div>}
        {success&&<div style={{padding:'10px 14px',borderRadius:10,marginBottom:14,background:'var(--gnl)',color:'#166534',fontSize:13,fontWeight:600,display:'flex',gap:8,alignItems:'center'}}><CheckCircle size={14}/>{success}</div>}
        <form onSubmit={submit}>
          {[{l:'Name',t:'text',ph:'Your name',v:fullName,s:setFullName,r:false},{l:'Email',t:'email',ph:'you@email.com',v:email,s:setEmail,r:true},{l:'Password',t:'password',ph:'min 6 chars',v:password,s:setPassword,r:true},{l:'Confirm',t:'password',ph:'••••••••',v:confirm,s:setConfirm,r:true}].map((f,i)=>(
            <div key={i} className="fg"><label>{f.l}</label><input type={f.t} placeholder={f.ph} value={f.v} required={f.r} onChange={e=>f.s(e.target.value)}/></div>
          ))}
          <button type="submit" disabled={loading} style={{width:'100%',padding:12,background:'var(--or)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:14,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:'pointer',marginTop:6,opacity:loading?.6:1}}>
            {loading?'Creating…':'Create Account'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:14,fontSize:12,color:'var(--mu)'}}>
          Have an account? <Link href="/login" style={{color:'var(--pu)',fontWeight:600}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
