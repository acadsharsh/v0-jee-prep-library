'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function Ticker({ text, color, bg, border, reverse }: { text: string; color: string; bg: string; border: string; reverse?: boolean }) {
  const items = Array(12).fill(null);
  return (
    <div className="ticker-wrap" style={{ borderColor: border, background: bg }}>
      <div className={`ticker-track${reverse ? ' rev' : ''}`}>
        {[...items, ...items].map((_, i) => (
          <span key={i} className="ticker-item" style={{ color }}>
            {text} <span style={{ opacity: 0.5 }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const FEATURE_CARDS = [
  {
    bg: '#F5C842', textColor: '#1A1A2E',
    icon: '📖', tag: 'Chapter-wise',
    title: 'Practice from HCV, Irodov & more',
    desc: 'Questions organized by chapter and difficulty. Pick up exactly where you need work.',
  },
  {
    bg: '#9B8BF4', textColor: '#FFFFFF',
    icon: '📊', tag: 'Analytics',
    title: 'Track your accuracy live',
    desc: 'See your score per chapter, per set. Know what\'s weak and fix it fast.',
  },
  {
    bg: '#F87171', textColor: '#FFFFFF',
    icon: '⚡', tag: 'Explanations',
    title: 'Learn from every mistake',
    desc: 'Every question has a full explanation. MCQ, MSQ, and Numerical all covered.',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="land-root">
      {/* NAV */}
      <nav className="land-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5C842', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#111' }}>J</div>
          <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 20, color: '#fff', letterSpacing: 1 }}>JEEPrep</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!loading && (user ? (
            <>
              <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 800, border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Dashboard</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} style={{ padding: '8px 18px', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Sign in</button>
              <button onClick={() => router.push('/signup')} style={{ padding: '10px 22px', borderRadius: 12, background: '#F5C842', color: '#111', fontSize: 14, fontWeight: 900, border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Get started →</button>
            </>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '140px 52px 72px', position: 'relative', overflow: 'hidden' }}>
        {/* Scattered decorative emojis */}
        {[
          { emoji: '📚', top: 110, right: 200, rot: 15, size: 56 },
          { emoji: '⚡', top: 200, right: 60, rot: -12, size: 44 },
          { emoji: '🎯', bottom: 80, right: 280, rot: 8, size: 50 },
          { emoji: '🚀', top: 170, left: '58%', rot: -6, size: 42 },
          { emoji: '✏️', top: 130, left: '72%', rot: 20, size: 40 },
          { emoji: '🧮', bottom: 120, left: '65%', rot: -8, size: 38 },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: d.top, bottom: d.bottom, right: d.right, left: d.left,
            fontSize: d.size, transform: `rotate(${d.rot}deg)`,
            pointerEvents: 'none', userSelect: 'none',
          }}>{d.emoji}</div>
        ))}

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, background: 'rgba(245,200,66,0.15)', border: '1.5px solid rgba(245,200,66,0.4)', marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#F5C842', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif' }}>🔥 JEE Advanced 2026</span>
          </div>

          {/* BIG HEADLINE */}
          <div className="land-h1" style={{ fontSize: 'clamp(52px, 8vw, 96px)', marginBottom: 4 }}>CREATE NEW</div>
          <div className="land-h1" style={{ fontSize: 'clamp(52px, 8vw, 96px)', color: '#F5C842', marginBottom: 4 }}>EXPERIENCE</div>
          <div className="land-h1" style={{ fontSize: 'clamp(52px, 8vw, 96px)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            WITH
            <span style={{
              background: '#9B8BF4', color: '#fff',
              padding: '4px 20px', borderRadius: 12, display: 'inline-block',
              fontFamily: 'Lilita One, cursive', fontSize: 'clamp(28px, 4vw, 52px)',
            }}>JEE PREP</span>
          </div>
          <div className="land-h1" style={{ fontSize: 'clamp(52px, 8vw, 96px)', marginBottom: 36 }}>
            <span style={{ color: '#F5C842', textDecoration: 'underline', textDecorationColor: '#9B8BF4', textDecorationThickness: 4 }}>PERFECT</span>{' '}
            <span style={{ WebkitTextStroke: '3px #fff', WebkitTextFillColor: 'transparent' }}>SCORE.</span>
          </div>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 460, lineHeight: 1.75, marginBottom: 40, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            Chapter-wise practice sets from HCV, Irodov &amp; more. Track your accuracy, crush weak spots, hit your JEE rank.
          </p>

          {!loading && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {user ? (
                <button onClick={() => router.push('/dashboard')} className="btn-land" style={{ background: '#F5C842', color: '#111', boxShadow: '0 8px 32px rgba(245,200,66,0.4)' }}>
                  My Dashboard 🚀
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/signup')} className="btn-land" style={{ background: '#F5C842', color: '#111', boxShadow: '0 8px 32px rgba(245,200,66,0.4)' }}>
                    Start for free →
                  </button>
                  <button onClick={() => router.push('/login')} className="btn-land" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)' }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* TICKER 1 */}
      <Ticker text="JEE ADVANCED 2026" color="#111" bg="#F5C842" border="#F5C842" />

      {/* FEATURE SECTION */}
      <section style={{ padding: '80px 52px' }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#9B8BF4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Nunito, sans-serif' }}>Our special programs</div>
          <div className="land-h1" style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05 }}>
            FOR YOUR{' '}
            <span style={{ background: '#9B8BF4', color: '#fff', padding: '2px 16px', borderRadius: 10, display: 'inline-block', fontFamily: 'Lilita One, cursive' }}>EDUCATION</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {FEATURE_CARDS.map((c, i) => (
            <div key={i} className="land-card" style={{ background: c.bg }}>
              {/* Top area */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 52 }}>{c.icon}</div>
                <span style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
                  padding: '4px 12px', borderRadius: 100,
                  background: 'rgba(0,0,0,0.12)', color: c.textColor, opacity: 0.8,
                  fontFamily: 'Nunito, sans-serif',
                }}>{c.tag}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 22, color: c.textColor, lineHeight: 1.2, marginBottom: 10 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: c.textColor, opacity: 0.72, lineHeight: 1.65, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER 2 */}
      <Ticker text="PHYSICS · CHEMISTRY · MATHEMATICS · MCQ · MSQ · NUMERICAL" color="#fff" bg="#9B8BF4" border="#9B8BF4" reverse />

      {/* EASY TO USE SECTION */}
      <section style={{ padding: '80px 52px' }}>
        <div className="land-h1" style={{ fontSize: 'clamp(36px, 5vw, 62px)', maxWidth: 700, marginBottom: 48, lineHeight: 1.05 }}>
          PRACTICE IS{' '}
          <span style={{ background: '#9B8BF4', color: '#fff', padding: '2px 16px', borderRadius: 10, fontFamily: 'Lilita One, cursive' }}>EASY</span>
          {' '}AND USEFUL FOR THE EXAM 🌍
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
          {[
            { icon: '📝', label: 'MCQ', desc: 'Single correct — classic JEE style. 4 options, one right.' },
            { icon: '☑️', label: 'MSQ', desc: 'Multiple correct — JEE Advanced specialty. Select all that apply.' },
            { icon: '🔢', label: 'Numerical', desc: 'Enter the exact number. Tolerance supported. Real JEE feel.' },
            { icon: '💡', label: 'Explanations', desc: 'Every answer explained in detail. Learn, not just practice.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 18, padding: '24px', display: 'flex', gap: 16, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 20, color: '#F5C842', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '0 52px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #9B8BF4 0%, #F87171 100%)',
          borderRadius: 28, padding: '60px 52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 28,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: 100, fontSize: 120, opacity: 0.15, fontFamily: 'Lilita One, cursive', color: '#fff' }}>JEE</div>
          <div>
            <div className="land-h1" style={{ fontSize: 'clamp(30px, 4vw, 52px)', color: '#fff', marginBottom: 10 }}>LET'S UNLOCK YOUR POTENTIAL</div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>Start practicing today. Track progress. Ace JEE.</p>
          </div>
          {!loading && !user && (
            <button onClick={() => router.push('/signup')} className="btn-land" style={{ background: '#F5C842', color: '#111', fontSize: 16, flexShrink: 0, boxShadow: '0 8px 32px rgba(245,200,66,0.4)' }}>
              TOTALLY FREE! →
            </button>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#F5C842' }}>JEEPrep</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'Nunito, sans-serif' }}>© JEEPrep 2026 All Rights Reserved</span>
      </div>
    </div>
  );
}
