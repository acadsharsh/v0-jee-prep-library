'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Book { id: string; slug: string; title: string; }
interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const SUBJECT_ICONS: Record<string, string> = { physics: '⚡', chemistry: '🧪', maths: '∑', math: '∑', hcv: '⚡', irodov: '🔬', ncert: '📗', dc: '⚗️' };
const BOOK_STYLES = [
  { bg: '#FDE68A', text: '#92400E' },
  { bg: '#DDD6FE', text: '#4C1D95' },
  { bg: '#FBCFE8', text: '#831843' },
  { bg: '#A7F3D0', text: '#064E3B' },
  { bg: '#BAE6FD', text: '#0C4A6E' },
  { bg: '#FCA5A5', text: '#7F1D1D' },
];
const CATS = ['All', 'Physics', 'Chemistry', 'Maths', 'HCV', 'Irodov'];
const CAT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
      <div style={{ fontSize: 11, color: '#7C8DB0', marginBottom: 3, fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 24, color: '#7C3AED' }}>{payload[0].value}%</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    (async () => {
      try {
        const [booksRes, { data }] = await Promise.all([
          fetch('/api/books'),
          supabase.from('quiz_attempts')
            .select('quiz_id, score, completed_at, quizzes(title)')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(10),
        ]);
        setBooks(await booksRes.json());
        if (data) {
          const fmt: AttemptData[] = data.map(a => ({
            title: (a.quizzes as any)?.title || 'Practice set',
            score: a.score ?? 0,
            date: new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            quiz_id: a.quiz_id,
          }));
          setAttempts(fmt);
          const seen = new Map();
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id, { name: a.title.split(' ').slice(0, 2).join(' '), score: a.score }); });
          setChartData(Array.from(seen.values()).slice(0, 6));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  const hexScore = (s: number) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';
  const bgScore  = (s: number) => s >= 75 ? '#D1FAE5' : s >= 50 ? '#FEF9C3' : '#FEE2E2';
  const txtScore = (s: number) => s >= 75 ? '#065F46' : s >= 50 ? '#92400E' : '#991B1B';

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#F2F4F8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #DDD6FE', borderTopColor: '#7C3AED', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#7C8DB0', fontSize: 14, fontWeight: 700 }}>Loading your dashboard…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main className="dash-root">
        {/* Header */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8EAF0', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 26, color: '#1A1A2E', lineHeight: 1 }}>Dashboard</div>
            <div style={{ fontSize: 13, color: '#7C8DB0', fontWeight: 700, marginTop: 3 }}>
              Hello, {user?.email?.split('@')[0] ?? 'Student'} 👋
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '6px 14px', borderRadius: 100, background: '#FDE68A', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💎</span>
              <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 15, color: '#92400E' }}>JEE 2026</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>

          {/* STAT CARDS */}
          <StatsDashboard />

          {/* CHAPTER WISE PRACTICE BANK */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 20, color: '#1A1A2E' }}>Chapter wise Practice Bank</div>
                <div style={{ fontSize: 12, color: '#7C8DB0', fontWeight: 700, marginTop: 2 }}>{books.length} books available</div>
              </div>
              <Link href="/" style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED' }}>VIEW ALL</Link>
            </div>

            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {CATS.map((cat, i) => (
                <button key={cat} onClick={() => setActiveCat(cat)} className="cat-pill"
                  style={{
                    color: activeCat === cat ? CAT_COLORS[i % CAT_COLORS.length] : '#7C8DB0',
                    background: activeCat === cat ? `${CAT_COLORS[i % CAT_COLORS.length]}18` : '#FFFFFF',
                    borderColor: activeCat === cat ? `${CAT_COLORS[i % CAT_COLORS.length]}50` : '#E8EAF0',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Book tiles grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
              {books.map((book, idx) => {
                const s = BOOK_STYLES[idx % BOOK_STYLES.length];
                const key = book.slug.toLowerCase();
                const icon = Object.entries(SUBJECT_ICONS).find(([k]) => key.includes(k))?.[1] ?? '📘';
                return (
                  <Link key={book.id} href={`/books/${book.slug}`}>
                    <div className="book-tile" style={{ background: s.bg }}>
                      <div style={{ fontSize: 44 }}>{icon}</div>
                      <div>
                        <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: s.text, lineHeight: 1.2, marginBottom: 4 }}>{book.title}</div>
                        <div style={{ fontSize: 11, color: s.text, opacity: 0.65, fontWeight: 800 }}>Practice now →</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CHART + RECENT */}
          <div style={{ display: 'grid', gridTemplateColumns: chartData.length ? '1.4fr 1fr' : '1fr', gap: 16, marginTop: 24 }}>
            {chartData.length > 0 && (
              <div className="d-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={17} color="#7C3AED" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 17, color: '#1A1A2E' }}>Score history</div>
                    <div style={{ fontSize: 11, color: '#7C8DB0', fontWeight: 700 }}>last {chartData.length} sets</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#B4BAD4', fontSize: 11, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: '#B4BAD4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 10 }} />
                    <Bar dataKey="score" radius={[10, 10, 4, 4]}>
                      {chartData.map((e, i) => <Cell key={i} fill={hexScore(e.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="d-card">
              <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#1A1A2E', marginBottom: 16 }}>Recent sessions</div>
              {attempts.length ? (
                <div>
                  {attempts.slice(0, 6).map((a, i) => (
                    <div key={i} className="attempt-row">
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: bgScore(a.score), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {a.score >= 75 ? '🏆' : a.score >= 50 ? '📈' : '📚'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>{a.title.length > 22 ? a.title.slice(0, 22) + '…' : a.title}</div>
                        <div style={{ fontSize: 11, color: '#7C8DB0', fontWeight: 700, marginTop: 2 }}>{a.date}</div>
                      </div>
                      <span className="score-badge" style={{ background: bgScore(a.score), color: txtScore(a.score) }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                  <p style={{ color: '#7C8DB0', fontSize: 14, fontWeight: 800, marginBottom: 8 }}>No sessions yet</p>
                  <p style={{ color: '#B4BAD4', fontSize: 12, fontWeight: 600 }}>Pick a book and start practicing</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
