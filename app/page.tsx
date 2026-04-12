'use client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Star, Zap, Target, BarChart2 } from 'lucide-react';

function Ticker({ text, color, bg, border, reverse }: { text: string; color: string; bg: string; border: string; reverse?: boolean }) {
  const items = Array(14).fill(null);
  return (
    <div className="ticker-wrap" style={{ borderColor: border, background: bg }}>
      <div className={`ticker-track${reverse ? ' reverse' : ''}`}>
        {[...items, ...items].map((_, i) => (
          <span key={i} className="ticker-item" style={{ color }}>
            {text} <span style={{ opacity: 0.4, fontSize: 14 }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero */}
      <section style={{ paddingTop: 130, paddingBottom: 80, paddingLeft: 48, paddingRight: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 80, right: 100, width: 320, height: 320, borderRadius: '50%', background: 'rgba(123,108,246,0.15)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 110, right: 180, fontSize: 52, transform: 'rotate(15deg)', pointerEvents: 'none' }}>📚</div>
        <div style={{ position: 'absolute', top: 220, right: 60, fontSize: 40, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>⚡</div>
        <div style={{ position: 'absolute', bottom: 100, right: 260, fontSize: 44, transform: 'rotate(8deg)', pointerEvents: 'none' }}>🎯</div>
        <div style={{ position: 'absolute', top: 160, left: '55%', fontSize: 36, transform: 'rotate(-5deg)', pointerEvents: 'none' }}>🚀</div>

        <div style={{ maxWidth: 680, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', marginBottom: 28 }}>
            <Star size={12} color="#f5c842" fill="#f5c842" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#f5c842', letterSpacing: '0.06em', textTransform: 'uppercase' }}>JEE Advanced 2026 Prep</span>
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 'clamp(48px, 7vw, 84px)', lineHeight: 0.95, letterSpacing: '-2px', color: '#ffffff', marginBottom: 12 }}>
            CREATE NEW
          </h1>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 'clamp(48px, 7vw, 84px)', lineHeight: 0.95, letterSpacing: '-2px', color: '#f5c842', marginBottom: 12 }}>
            EXPERIENCE
          </h1>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 'clamp(48px, 7vw, 84px)', lineHeight: 0.95, letterSpacing: '-2px', color: '#ffffff', marginBottom: 36 }}>
            WITH JEE PREP.
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.75, marginBottom: 40 }}>
            Chapter-wise practice from HCV, Irodov &amp; more. Track your accuracy, fix your weak spots, climb the rank list.
          </p>

          {!authLoading && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {user ? (
                <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: '#f5c842', color: '#1a1a2e', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}>
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/signup')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: '#f5c842', color: '#1a1a2e', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}>
                    Start for free <ArrowRight size={16} />
                  </button>
                  <button onClick={() => router.push('/login')} style={{ padding: '14px 28px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Ticker text="JEE ADVANCED 2026" color="#1a1a2e" bg="#f5c842" border="#f5c842" />

      {/* Feature cards */}
      <section style={{ padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7b6cf6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>What you get</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 38, color: '#ffffff', letterSpacing: '-0.5px' }}>
            BUILT FOR{' '}
            <span style={{ background: '#7b6cf6', color: '#fff', padding: '2px 14px', borderRadius: 8, display: 'inline-block' }}>JEE</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          {[
            { color: '#f5c842', text: '#1a1a2e', icon: '📖', title: 'Chapter-wise Practice', desc: 'HCV, Irodov and more. Organized by book, class and chapter.' },
            { color: '#7b6cf6', text: '#ffffff', icon: '📊', title: 'Live Analytics', desc: 'Your accuracy per chapter. Know exactly what needs work.' },
            { color: '#f87171', text: '#ffffff', icon: '⚡', title: 'Instant Explanations', desc: 'Every question explained. Learn from every wrong answer.' },
            { color: '#34d399', text: '#1a1a2e', icon: '🎯', title: 'MCQ + MSQ + Numerical', desc: 'All question types from actual JEE papers, in one place.' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.color, borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'transform 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 40 }}>{c.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: c.text, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: c.text, opacity: 0.72, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Ticker text="PHYSICS · CHEMISTRY · MATHEMATICS · MCQ · MSQ · NUMERICAL" color="#ffffff" bg="#7b6cf6" border="#7b6cf6" reverse />

      {/* CTA */}
      <section style={{ padding: '64px 48px 80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #7b6cf6, #f87171)', borderRadius: 24, padding: '56px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 34, color: '#ffffff', marginBottom: 10, letterSpacing: '-0.5px' }}>UNLOCK YOUR POTENTIAL</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>Start practicing today. See your progress. Ace JEE.</p>
          </div>
          {!authLoading && !user && (
            <button onClick={() => router.push('/signup')} style={{ padding: '16px 36px', borderRadius: 14, background: '#f5c842', color: '#1a1a2e', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              Get started free →
            </button>
          )}
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 14, color: '#f5c842' }}>JEEPrep</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 All rights reserved</span>
      </div>
    </div>
  );
}
