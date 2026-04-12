'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';

interface Book { id: string; slug: string; title: string; cover_image_url: string | null; }
interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const BOOK_ICONS: Record<string, string> = {
  hcv: '⚡', irodov: '🔬', ncert: '📗', dc: '⚗️', sl: '🧮',
};
const BOOK_COLORS = [
  { bg: '#1e2235', border: '#2d3255', accent: '#7b6cf6' },
  { bg: '#1e2535', border: '#2d3555', accent: '#ff7d3b' },
  { bg: '#1e3530', border: '#2d5548', accent: '#34d399' },
  { bg: '#352520', border: '#553528', accent: '#f87171' },
  { bg: '#352535', border: '#553555', accent: '#c084fc' },
];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2235', border: '1px solid #2d3255', borderRadius: 10, padding: '8px 14px' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 900, color: '#7b6cf6' }}>{payload[0].value}%</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    (async () => {
      try {
        // Fetch books and attempts in parallel
        const [booksRes, attemptsRes] = await Promise.all([
          fetch('/api/books'),
          supabase.from('quiz_attempts').select('quiz_id, score, completed_at, quizzes(title)')
            .eq('user_id', user.id).order('completed_at', { ascending: false }).limit(10),
        ]);

        const booksData = await booksRes.json();
        setBooks(booksData);

        const { data } = attemptsRes;
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

  const hexScore = (s: number) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const cssScore = (s: number) => s >= 75 ? '#34d399' : s >= 50 ? '#f5c842' : '#f87171';
  const bgScore  = (s: number) => s >= 75 ? 'rgba(52,211,153,0.15)' : s >= 50 ? 'rgba(245,200,66,0.15)' : 'rgba(248,113,113,0.15)';

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#12141f' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #2d3255', borderTopColor: '#7b6cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 700 }}>Loading…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background: '#12141f', minHeight: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div style={{ background: '#1a1c2e', borderBottom: '1px solid #2d3255', padding: '20px 28px' }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Overview</div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 26, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Hello, {user?.email?.split('@')[0] ?? 'Student'} 👋
          </h1>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Stats */}
          <StatsDashboard />

          {/* Chapter wise practice bank — ditto tile grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 4 }}>Practice Bank</div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 18, color: '#ffffff' }}>Chapter wise Practice Bank</h2>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#7b6cf6', cursor: 'pointer' }}>VIEW ALL</span>
            </div>

            {/* Book tiles — ditto style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {books.map((book, idx) => {
                const c = BOOK_COLORS[idx % BOOK_COLORS.length];
                const key = book.slug.toLowerCase();
                const icon = Object.entries(BOOK_ICONS).find(([k]) => key.includes(k))?.[1] ?? '📘';
                return (
                  <Link key={book.id} href={`/books/${book.slug}`}>
                    <div style={{
                      background: c.bg, borderRadius: 14,
                      border: `1px solid ${c.border}`,
                      padding: '20px 16px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column', gap: 12,
                      minHeight: 130,
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = c.accent; el.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = c.border; el.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ fontSize: 36 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2, marginBottom: 4 }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: 11, color: c.accent, fontWeight: 700 }}>Practice →</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Chart + Recent — two col */}
          <div style={{ display: 'grid', gridTemplateColumns: chartData.length ? '1.5fr 1fr' : '1fr', gap: 16 }}>
            {chartData.length > 0 && (
              <div style={{ background: '#1a1c2e', border: '1px solid #2d3255', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#2d3255', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={16} color="#7b6cf6" />
                  </div>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: '#ffffff' }}>Score history</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} cursor={{ fill: 'rgba(123,108,246,0.08)', radius: 8 }} />
                    <Bar dataKey="score" radius={[8, 8, 4, 4]}>
                      {chartData.map((e, i) => <Cell key={i} fill={hexScore(e.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ background: '#1a1c2e', border: '1px solid #2d3255', borderRadius: 16, padding: '24px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: '#ffffff', marginBottom: 16 }}>Recent sessions</div>
              {attempts.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attempts.slice(0, 6).map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: '#12141f' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{a.title.length > 22 ? a.title.slice(0, 22) + '…' : a.title}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{a.date}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: bgScore(a.score), color: cssScore(a.score), fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
                  <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>No sessions yet</p>
                  <p style={{ color: '#4b5563', fontSize: 12, fontWeight: 600 }}>Pick a book above and start practicing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
