'use client';

import { Navigation } from '@/components/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      if (data.session) router.push('/dashboard');
    } catch { setError('An error occurred during login'); }
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
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#f0f2f7', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: '#8b92a5', fontSize: 14 }}>Sign in to track your grind</p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: 13,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#4a5168" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="email" placeholder="you@example.com" value={email} required
                onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#4a5168" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="password" placeholder="••••••••" value={password} required
                onChange={e => setPassword(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <button type="submit" disabled={isLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 10,
              background: isLoading ? 'rgba(79,142,247,0.5)' : '#4f8ef7',
              border: 'none', color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 24px rgba(79,142,247,0.35)',
              marginTop: 4,
            }}>
              {isLoading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8b92a5' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#4f8ef7', fontWeight: 700, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
