'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Bookshelf } from '@/components/bookshelf';
import { Book } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

function Ticker({ text, color, bg, reverse }: { text:string; color:string; bg:string; reverse?:boolean }) {
  const items = Array(12).fill(text);
  return (
    <div className="ticker-wrap" style={{ borderColor:color, background:bg }}>
      <div className={`ticker-track ${reverse ? 'reverse' : ''}`}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="ticker-item" style={{ color }}>
            {t} <span style={{ opacity:0.4 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/books').then(r=>r.json()).then(setBooks).catch(console.error).finally(()=>setIsLoading(false));
  }, []);

  return (
    <>
      <Navigation />

      {/* Top ticker */}
      <Ticker text="JEE ADVANCED 2026" color="var(--black)" bg="var(--lime)" />

      {/* Hero */}
      <section style={{ padding:'64px 40px 56px', borderBottom:'1.5px solid var(--dim)', position:'relative', overflow:'hidden' }}>
        {/* Big asterisk decoration */}
        <div style={{
          position:'absolute', right:60, top:40,
          fontSize:200, fontWeight:700, color:'var(--black-3)',
          lineHeight:1, fontFamily:'Space Mono, monospace',
          userSelect:'none', pointerEvents:'none',
        }}>✦</div>

        <div style={{ maxWidth:760, position:'relative' }}>
          <div className="section-label" style={{ marginBottom:20 }}>
            Physics · Chemistry · Maths
          </div>

          <h1 style={{
            fontFamily:'Space Grotesk, sans-serif',
            fontWeight:700,
            fontSize:'clamp(48px, 8vw, 88px)',
            lineHeight:0.95,
            letterSpacing:'-2px',
            color:'var(--white)',
            marginBottom:32,
          }}>
            CRACK<br />
            <span style={{ color:'var(--lime)' }}>JEE*</span><br />
            OR DIE<br />TRYING.
          </h1>

          <p style={{ fontSize:16, color:'var(--muted)', maxWidth:440, lineHeight:1.7, marginBottom:36 }}>
            Chapter-wise quizzes from HCV, Irodov &amp; more.
            Track your accuracy. Fix what's weak. Get the rank.
          </p>

          {!authLoading && (
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {user ? (
                <button onClick={() => router.push('/dashboard')} className="btn-lime">
                  Dashboard →
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/signup')} className="btn-lime">
                    Start for free →
                  </button>
                  <button onClick={() => router.push('/books/hcv')} className="btn-outline">
                    Browse quizzes
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1.5px solid var(--dim)' }}>
        {[
          { num:'HCV', label:'Halliday Resnick Krane', sub:'40 chapters' },
          { num:'PYQ', label:'Previous year questions', sub:'chapter-wise' },
          { num:'100%', label:'Free to use', sub:'no paywalls' },
        ].map((s,i) => (
          <div key={i} className="stat-box" style={{
            borderRight: i < 2 ? '1.5px solid var(--dim)' : 'none',
            borderTop:'none', borderBottom:'none', borderLeft:'none',
          }}>
            <div className="stat-num" style={{ color: i===0 ? 'var(--lime)' : i===1 ? 'var(--mint)' : 'var(--yellow)' }}>
              {s.num}
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--white)' }}>{s.label}</div>
            <div className="section-label" style={{ marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom ticker */}
      <Ticker text="PHYSICS · CHEMISTRY · MATHEMATICS" color="var(--yellow)" bg="transparent" reverse />

      {/* Book library */}
      <section style={{ padding:'40px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:24 }}>
          <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>BOOKS</h2>
          {!isLoading && <span className="section-label">{books.length} available</span>}
        </div>
        <Bookshelf books={books} isLoading={isLoading} />
      </section>
    </>
  );
}
