'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Bookshelf } from '@/components/bookshelf';
import { Book } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Flame, Target, BarChart2 } from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then(setBooks).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--bg-0)', minHeight: 'calc(100vh - 48px)' }}>

        {/* Hero strip — compact, not flashy */}
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '40px 40px 36px',
          background: 'var(--bg-1)',
        }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11.5, fontWeight: 600, color: 'var(--acc)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              <Flame size={12} /> JEE 2026 Prep
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: 'var(--tx-1)',
              lineHeight: 1.25, marginBottom: 10,
              letterSpacing: '-0.3px',
            }}>
              Chapter-wise quizzes.<br />
              Track what you know.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--tx-2)', lineHeight: 1.65, marginBottom: 24, maxWidth: 480 }}>
              Practice from HCV, Irodov &amp; more. See your accuracy per chapter, fix weak spots, move faster.
            </p>

            {!authLoading && !user && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => router.push('/signup')} className="btn-acc">
                  Start for free <ArrowRight size={13} />
                </button>
                <button onClick={() => router.push('/books/hcv')} className="btn-ghost">
                  Browse quizzes
                </button>
              </div>
            )}
            {!authLoading && user && (
              <button onClick={() => router.push('/dashboard')} className="btn-acc">
                My dashboard <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Inline stats row */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 32,
            paddingTop: 24, borderTop: '1px solid var(--border)',
          }}>
            {[
              { icon: <Target size={14} />, val: 'Chapter-wise', sub: 'organized by book & class' },
              { icon: <BarChart2 size={14} />, sub: 'score & accuracy per attempt' , val: 'Live analytics' },
              { icon: <Flame size={14} />, val: 'Instant feedback', sub: 'explanations on every Q' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--acc)' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>{s.val}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book library */}
        <div style={{ padding: '28px 40px' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>Available books</span>
            {!isLoading && (
              <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>{books.length} books</span>
            )}
          </div>
          <Bookshelf books={books} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
