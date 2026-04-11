'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Bookshelf } from '@/components/bookshelf';
import { Book } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, BookOpen, BarChart3, Zap, Target } from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/books')
      .then(r => r.json())
      .then(d => setBooks(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const features = [
    { icon: <BookOpen size={20} />, label: 'Chapter-wise quizzes', desc: 'HCV, Irodov & more' },
    { icon: <BarChart3 size={20} />, label: 'Performance analytics', desc: 'Track every attempt' },
    { icon: <Target size={20} />, label: 'Instant feedback', desc: 'Explanations on-the-fly' },
    { icon: <Zap size={20} />, label: 'Adaptive difficulty', desc: 'Built for JEE Advanced' },
  ];

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

        {/* Hero */}
        <section className="grid-bg" style={{
          padding: '80px 24px 100px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 400,
            background: 'radial-gradient(ellipse at center, rgba(79,142,247,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 80, right: 80,
            width: 300, height: 300,
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
            {/* Badge */}
            <div className="animate-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              borderRadius: 100,
              border: '1px solid rgba(79,142,247,0.3)',
              background: 'rgba(79,142,247,0.08)',
              marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7', boxShadow: '0 0 8px #4f8ef7' }} />
              <span style={{ fontSize: 12, color: '#4f8ef7', fontWeight: 600, letterSpacing: '0.05em' }}>
                JEE 2025 · Physics · Chemistry · Maths
              </span>
            </div>

            <h1 className="animate-fade-up" style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(42px, 7vw, 80px)',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#f0f2f7',
              marginBottom: 24,
              animationDelay: '0.05s',
            }}>
              Crack JEE with<br />
              <span style={{
                background: 'linear-gradient(90deg, #4f8ef7, #8b5cf6 50%, #4f8ef7)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}>
                zero bullshit.
              </span>
            </h1>

            <p className="animate-fade-up" style={{
              fontSize: 18,
              color: '#8b92a5',
              maxWidth: 560,
              lineHeight: 1.7,
              marginBottom: 40,
              animationDelay: '0.1s',
            }}>
              Chapter-wise quizzes from HCV, Irodov &amp; more. Instant explanations, real analytics. No fluff — just results.
            </p>

            <div className="animate-fade-up" style={{ display: 'flex', gap: 12, animationDelay: '0.15s', flexWrap: 'wrap' }}>
              {!authLoading && !user ? (
                <>
                  <button onClick={() => router.push('/signup')} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '13px 28px',
                    borderRadius: 10,
                    background: '#4f8ef7',
                    color: '#fff',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 15, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 30px rgba(79,142,247,0.35)',
                  }}>
                    Get started free <ArrowRight size={16} />
                  </button>
                  <button onClick={() => router.push('/books/hcv')} style={{
                    padding: '13px 28px',
                    borderRadius: 10,
                    background: 'transparent',
                    color: '#f0f2f7',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 15, fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    Browse quizzes
                  </button>
                </>
              ) : (
                <button onClick={() => router.push('/dashboard')} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px',
                  borderRadius: 10,
                  background: '#4f8ef7',
                  color: '#fff',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 15, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(79,142,247,0.35)',
                }}>
                  My dashboard <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Feature pills */}
            <div className="animate-fade-up" style={{
              display: 'flex', gap: 10, marginTop: 52, flexWrap: 'wrap',
              animationDelay: '0.2s',
            }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <span style={{ color: '#4f8ef7' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f7' }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: '#8b92a5' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Books */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#4f8ef7', marginBottom: 10, textTransform: 'uppercase' }}>
              Resource Library
            </div>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800, fontSize: 32,
              color: '#f0f2f7', letterSpacing: '-0.5px',
            }}>
              Available books
            </h2>
          </div>
          <Bookshelf books={books} isLoading={isLoading} />
        </section>
      </main>
    </>
  );
}
