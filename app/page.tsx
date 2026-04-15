'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const BOOKS = ['HC Verma', 'Irodov', 'Pathfinder', 'Black Book', 'DC Pandey', 'MS Chouhan'];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="landing-root">
      <nav className="landing-nav">
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: 'var(--yellow)', letterSpacing: 1 }}>JEEPREP</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!loading && (user ? (
            <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ fontSize: 13 }}>Dashboard →</button>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="btn-ghost" style={{ fontSize: 13 }}>Sign in</button>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ fontSize: 13 }}>Get started →</button>
            </>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,200,66,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(167,139,250,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        
        <div className="badge badge-yellow" style={{ marginBottom: 24, fontSize: 12, padding: '6px 16px' }}>
          <span style={{ width: 6, height: 6, background: 'var(--lime)', borderRadius: '50%', display: 'inline-block', marginRight: 6, animation: 'pulse-dot 2s ease-in-out infinite' }} />
          JEE Advanced 2026 Prep
        </div>
        <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

        <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 22, maxWidth: 740 }}>
          Master JEE with
          <span style={{ color: 'var(--yellow)', display: 'block' }}>Chapter-wise Practice</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 520, lineHeight: 1.75, marginBottom: 40, fontWeight: 400 }}>
          Practice from HCV, Irodov & more. Track accuracy per chapter. Auto-generated flashcards from your mistakes. KaTeX math support.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          {!loading && (user ? (
            <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>Go to Dashboard →</button>
          ) : (
            <>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>Start for free →</button>
              <button onClick={() => router.push('/login')} className="btn-ghost" style={{ fontSize: 15, padding: '12px 24px' }}>Sign in</button>
            </>
          ))}
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 960, width: '100%' }}>
          {[
            { icon: '📐', title: 'MCQ + MSQ + Numerical', desc: 'All JEE question types. $F=ma$ KaTeX math rendering.' },
            { icon: '📕', title: 'Mistake Notebook', desc: 'Tracks every wrong answer. Chapter-wise & topic-wise view.' },
            { icon: '🔁', title: 'Spaced Repetition', desc: 'SM-2 flashcards auto-generated from your mistakes.' },
            { icon: '📊', title: 'Deep Analytics', desc: 'Chapter accuracy, weak topics, daily streak, score history.' },
            { icon: '✏', title: 'Diagram Lab', desc: 'Excalidraw for diagrams, Circuit simulator, Desmos graphs.' },
            { icon: '⚗', title: 'PhET Simulations', desc: 'Interactive physics & chemistry simulations embedded.' },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ textAlign: 'left', cursor: 'default', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Books strip */}
      <div style={{ padding: '0 52px 80px' }}>
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--faint)', marginBottom: 20 }}>Supported books</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {BOOKS.map(b => <span key={b} className="badge badge-muted" style={{ fontSize: 12, padding: '6px 14px' }}>{b}</span>)}
        </div>
      </div>

      <footer style={{ padding: '20px 52px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--yellow)', fontSize: 14 }}>JEEPREP</span>
        <span style={{ fontSize: 12, color: 'var(--faint)' }}>© 2026 · Built for JEE & NEET</span>
      </footer>
    </div>
  );
}
