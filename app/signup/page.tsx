'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName,setFullName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const router=useRouter();

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setError('');setSuccess('');setLoading(true);
    if(password!==confirm){setError('Passwords do not match');setLoading(false);return;}
    if(password.length<6){setError('Min 6 characters');setLoading(false);return;}
    try{
      const{data:{user},error:err}=await supabase.auth.signUp({email,password});
      if(err){setError(err.message);return;}
      if(user){await supabase.from('profiles').insert({id:user.id,username:fullName||email.split('@')[0],role:'user'});setSuccess('Done! Check email to verify.');setTimeout(()=>router.push('/login'),2500);}
    }catch{setError('Signup failed');}finally{setLoading(false);}
  };

  return (
    <div className="neo-auth-root">
      <div className="neo-auth-card fade-up">
        <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'#999',marginBottom:6}}>// REGISTER</div>
        <h2 style={{fontSize:26,fontWeight:700,letterSpacing:'-0.5px',marginBottom:4}}>Get started.</h2>
        <p style={{fontSize:13,color:'#777',marginBottom:24,fontWeight:500}}>Free forever. No credit card.</p>

        {error&&<div style={{padding:'10px 14px',background:'#ff4d4d',color:'#fff',border:'3px solid #0a0a0a',marginBottom:14,fontWeight:700,fontSize:13}}>{error}</div>}
        {success&&<div style={{padding:'10px 14px',background:'#b8f72b',color:'#0a0a0a',border:'3px solid #0a0a0a',marginBottom:14,fontWeight:700,fontSize:13}}>✓ {success}</div>}

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
          {[{l:'NAME',t:'text',ph:'Your name',v:fullName,s:setFullName,r:false},{l:'EMAIL',t:'email',ph:'you@example.com',v:email,s:setEmail,r:true},{l:'PASSWORD',t:'password',ph:'min 6 chars',v:password,s:setPassword,r:true},{l:'CONFIRM',t:'password',ph:'repeat password',v:confirm,s:setConfirm,r:true}].map((f,i)=>(
            <div key={i}>
              <label style={{display:'block',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#0a0a0a',marginBottom:6,fontFamily:'Space Mono,monospace'}}>{f.l}</label>
              <input type={f.t} placeholder={f.ph} value={f.v} required={f.r} onChange={e=>f.s(e.target.value)} className="neu-input"/>
            </div>
          ))}
          <button type="submit" disabled={loading} className="neu-btn" style={{marginTop:6,justifyContent:'center',width:'100%',padding:13,fontSize:14,opacity:loading?.6:1}}>
            {loading?'CREATING…':'CREATE ACCOUNT →'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#777',fontWeight:600}}>
          Have an account? <Link href="/login" style={{color:'#0a0a0a',fontWeight:800,textDecoration:'underline',textDecorationStyle:'wavy'}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
