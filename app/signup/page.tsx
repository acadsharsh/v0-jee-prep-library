'use client';

import { Navigation } from '@/components/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

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
    } catch { setError('Signup failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: 'calc(100vh - 48px)', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="fade-in" style={{
          width: '100%', maxWidth: 380,
          background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 4 }}>Create account</div>
            <div style={{ fontSize: 13, color: 'var(--tx-3)' }}>Start tracking your JEE prep</div>
          </div>
          <div style={{ padding: 24 }}>
            {error && <div style={{ padding: '9px 12px', borderRadius: 5, marginBottom: 14, background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
            {success && (
              <div style={{ padding: '9px 12px', borderRadius: 5, marginBottom: 14, background: 'var(--green-dim)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: 12.5, display: 'flex', gap: 7, alignItems: 'center' }}>
                <CheckCircle size={13} />{success}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Full name', type: 'text', ph: 'John Doe', val: fullName, set: setFullName, req: false },
                { label: 'Email', type: 'email', ph: 'you@example.com', val: email, set: setEmail, req: true },
                { label: 'Password', type: 'password', ph: '••••••••', val: password, set: setPassword, req: true },
                { label: 'Confirm password', type: 'password', ph: '••••••••', val: confirmPassword, set: setConfirmPassword, req: true },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={f.val} required={f.req}
                    onChange={e => f.set(e.target.value)} style={{ width: '100%' }} />
                </div>
              ))}
              <button type="submit" disabled={isLoading} className="btn-acc"
                style={{ marginTop: 6, justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
                {isLoading ? 'Creating…' : <><span>Create account</span><ArrowRight size={13} /></>}
              </button>
            </form>
            <p style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 16, textAlign: 'center' }}>
              Have an account?{' '}
              <Link href="/login" style={{ color: 'var(--acc)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
