'use client';

import { Navigation } from '@/components/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setIsLoading(true);
    if (password !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return; }
    try {
      const { data: { user }, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); return; }
      if (user) {
        await supabase.from('user_profiles').insert({ user_id: user.id, full_name: fullName || email.split('@')[0], is_admin: false });
        setSuccess('Account created! Check your email to verify.');
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch { setError('An error occurred during signup'); }
    finally { setIsLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 42px',
    borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)', color: '#f0f2f7',
    fontSize: 14, fontFamily: 'Syne, sans-serif', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="animate-scale-in" style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '44px 36px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #22c55e, #4f8ef7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#f0f2f7', marginBottom: 6 }}>Start your grind</h1>
            <p style={{ color: '#8b92a5', fontSize: 14 }}>Create your free JEE prep account</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>{error}</div>
          )}
          {success && (
            <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <CheckCircle size={15} />{success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <User size={15} />, type: 'text', ph: 'Full name', val: fullName, set: setFullName, req: false },
              { icon: <Mail size={15} />, type: 'email', ph: 'Email address', val: email, set: setEmail, req: true },
              { icon: <Lock size={15} />, type: 'password', ph: 'Password', val: password, set: setPassword, req: true },
              { icon: <Lock size={15} />, type: 'password', ph: 'Confirm password', val: confirmPassword, set: setConfirmPassword, req: true },
            ].map((f, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5168', pointerEvents: 'none' }}>{f.icon}</span>
                <input type={f.type} placeholder={f.ph} value={f.val} required={f.req}
                  onChange={e => f.set(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            ))}
            <button type="submit" disabled={isLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 10,
              background: isLoading ? 'rgba(34,197,94,0.5)' : '#22c55e',
              border: 'none', color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 24px rgba(34,197,94,0.3)', marginTop: 6,
            }}>
              {isLoading ? 'Creating…' : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8b92a5' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#4f8ef7', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
