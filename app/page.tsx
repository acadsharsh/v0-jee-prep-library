'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Book } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { BookOpen, BarChart2, Zap, ArrowRight, Target, Star } from 'lucide-react';

function Ticker({ text, color, bg, border, reverse }: { text: string; color: string; bg: string; border: string; reverse?: boolean }) {
  const items = Array(12).fill(null);
  return (
    <div className="ticker-wrap" style={{ borderColor: border, background: bg }}>
      <div className={`ticker-track${reverse ? ' reverse' : ''}`}>
        {[...items, ...items].map((_, i) => (
          <span key={i} className="ticker-item" style={{ color }}>
            {text} <span style={{ opacity: 0.4, fontSize: 16 }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const BOOK_COLORS = [
  { bg: '#f5c842', text: '#1a1a2e', icon: '⚡' },
  { bg: '#7b6cf6', text: '#ffffff', icon: '🔬' },
  { bg: '#f87171', text: '#ffffff', icon: '∑' },
  { bg: '#34d399', text: '#1a1a2e', icon: '🧲' },
];

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then(setBooks).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero */}
      <section style={{
        paddingTop: 140, paddingBottom: 80, paddingLeft: 48, paddingRight: 48,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: 80, right: 120, width: 300, height: 300, borderRadius: '50%', background: 'rgba(123,108,246,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,200,66,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* Floating emoji decorations */}
        <div style={{ position: 'absolute', top: 120, right: 200, fontSize: 48, transform: 'rotate(15deg)', pointerEvents: 'none' }}>📚</div>
        <div style={{ position: 'absolute', top: 200, right: 80, fontSize: 36, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>⚡</div>
        <div style={{ position: 'absolute', bottom: 100, right: 280, fontSize: 40, transform: 'rotate(8deg)', pointerEvents: 'none' }}>🎯</div>

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)',
            marginBottom: 28,
          }}>
            <Star size={12} color="#f5c842" fill="#f5c842" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#f5c842', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              JEE Advanced 2026 Prep
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(48px, 7vw, 82px)',
            lineHeight: 1.0,
            letterSpacing: '-2px',
            color: '#ffffff',
            marginBottom: 12,
          }}>
            CREATE NEW
          </h1>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(48px, 7vw, 82px)',
            lineHeight: 1.0,
            letterSpacing: '-2px',
            color: '#f5c842',
            marginBottom: 12,
          }}>
            EXPERIENCE
          </h1>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(48px, 7vw, 82px)',
            lineHeight: 1.0,
            letterSpacing: '-2px',
            color: '#ffffff',
            marginBottom: 36,
          }}>
            WITH JEE PREP.
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            Chapter-wise quizzes from HCV, Irodov &amp; more. Track your accuracy per chapter, crush your weak spots, climb the rank.
          </p>

          {!authLoading && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {user ? (
                <button onClick={() => router.push('/dashboard')} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', borderRadius: 14,
                  background: '#f5c842', color: '#1a1a2e',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 900,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(245,200,66,0.35)',
                }}>
                  My Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/signup')} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', borderRadius: 14,
                    background: '#f5c842', color: '#1a1a2e',
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 900,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(245,200,66,0.35)',
                  }}>
                    Start for free <ArrowRight size={16} />
                  </button>
                  <button onClick={() => router.push('/books/hcv')} style={{
                    padding: '14px 28px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.08)', color: '#ffffff',
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700,
                    border: '1.5px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  }}>
                    Browse quizzes
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Ticker — yellow */}
      <Ticker text="JEE ADVANCED 2026" color="#1a1a2e" bg="#f5c842" border="#f5c842" />

      {/* Feature cards */}
      <section style={{ padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7b6cf6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Our special programs
          </div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900, fontSize: 40, color: '#ffffff',
            letterSpacing: '-0.5px',
          }}>
            FOR YOUR{' '}
            <span style={{
              background: '#7b6cf6', color: '#fff', padding: '2px 14px',
              borderRadius: 8, display: 'inline-block',
            }}>EDUCATION</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { color: '#f5c842', textColor: '#1a1a2e', icon: '📖', title: 'Chapter-wise Quizzes', desc: 'Practice HCV, Irodov and more. Questions organized by chapter and difficulty.' },
            { color: '#7b6cf6', textColor: '#ffffff', icon: '📊', title: 'Performance Analytics', desc: 'See your accuracy per chapter. Know exactly where you need more work.' },
            { color: '#f87171', textColor: '#ffffff', icon: '⚡', title: 'Instant Explanations', desc: 'Every question has a detailed explanation. Learn from every mistake.' },
            { color: '#34d399', textColor: '#1a1a2e', icon: '🎯', title: 'Multi-type Questions', desc: 'MCQ, MSQ and Numerical — all question types from actual JEE papers.' },
          ].map((c, i) => (
            <div key={i} style={{
              background: c.color, borderRadius: 20, padding: '28px 24px',
              display: 'flex', flexDirection: 'column', gap: 14,
              transition: 'transform 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 40 }}>{c.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: c.textColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: c.textColor, opacity: 0.75, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker 2 — purple */}
      <Ticker text="PHYSICS · CHEMISTRY · MATHEMATICS · MCQ · MSQ · NUMERICAL" color="#ffffff" bg="#7b6cf6" border="#7b6cf6" reverse />

      {/* Books section */}
      <section style={{ padding: '64px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 36, color: '#ffffff', letterSpacing: '-0.5px' }}>
            AVAILABLE BOOKS
          </h2>
          {!isLoading && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{books.length} books</span>}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 160, borderRadius: 20, background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {books.map((book, idx) => {
              const c = BOOK_COLORS[idx % BOOK_COLORS.length];
              return (
                <Link key={book.id} href={`/books/${book.slug}`}>
                  <div style={{
                    background: c.bg, borderRadius: 20, padding: '28px 24px',
                    minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: 32 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: c.text, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: 12, color: c.text, opacity: 0.6, fontWeight: 700 }}>
                        View chapters →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section style={{ padding: '0 48px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #7b6cf6 0%, #f87171 100%)',
          borderRadius: 24, padding: '56px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
        }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 36, color: '#ffffff', marginBottom: 10, letterSpacing: '-0.5px' }}>
              LET&apos;S UNLOCK YOUR POTENTIAL
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>Start practicing today. Track your progress. Ace JEE.</p>
          </div>
          {!authLoading && !user && (
            <button onClick={() => router.push('/signup')} style={{
              padding: '16px 36px', borderRadius: 14,
              background: '#f5c842', color: '#1a1a2e',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 900,
              border: 'none', cursor: 'pointer', flexShrink: 0,
            }}>
              Get started free →
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 14, color: '#f5c842' }}>JEEPrep</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 All rights reserved</span>
      </div>
    </div>
  );
}
