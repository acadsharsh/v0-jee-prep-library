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
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    if (password !== confirm) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length < 6) { setError('Min 6 characters'); setLoading(false); return; }
    try {
      const { data: { user }, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); return; }
      if (user) {
        // Use correct table: profiles, columns: id, username, role
        await supabase.from('profiles').insert({ id: user.id, username: fullName || email.split('@')[0], role: 'user' });
        setSuccess('Account created! Check your email to verify.');
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch { setError('Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 400, background: '#ffffff', borderRadius: 24, overflow: 'hidden', border: '1px solid #e8e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #e8e8f0', background: '#fff3ee' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1e1e2d', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>Join JEEPrep 🚀</div>
            <div style={{ fontSize: 14, color: '#ff7d3b', fontWeight: 700 }}>Start cracking JEE today — it's free</div>
          </div>
          <div style={{ padding: '28px 32px' }}>
            {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: '#fee2e2', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>{error}</div>}
            {success && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: '#d1fae5', color: '#059669', fontSize: 13, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={14} />{success}</div>}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Full name', type: 'text', ph: 'John Doe', val: fullName, set: setFullName, req: false },
                { label: 'Email', type: 'email', ph: 'you@example.com', val: email, set: setEmail, req: true },
                { label: 'Password', type: 'password', ph: '••••••••', val: password, set: setPassword, req: true },
                { label: 'Confirm password', type: 'password', ph: '••••••••', val: confirm, set: setConfirm, req: true },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                  <input type={f.type} placeholder={f.ph} value={f.val} required={f.req} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-orange" style={{ marginTop: 6, justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creating…' : <><span>Create account</span><ArrowRight size={15} /></>}
              </button>
            </form>
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 20, fontWeight: 700 }}>
              Have an account?{' '}<Link href="/login" style={{ color: '#7b6cf6', fontWeight: 800 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
