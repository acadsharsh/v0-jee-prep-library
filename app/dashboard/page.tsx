'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MoreHorizontal, ArrowRight, Trophy, TrendingUp, BookOpen, Zap } from 'lucide-react';

interface Book { id: string; slug: string; title: string; }
interface AttemptData { title: string; score: number; date: string; quiz_id: string; }
interface Stats { total: number; avg: number; unique: number; last: string | null; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const BOOK_STYLES = [
  { bg: '#FDE68A', text: '#92400E', icon: '⚡' },
  { bg: '#DDD6FE', text: '#4C1D95', icon: '🔬' },
  { bg: '#FBCFE8', text: '#831843', icon: '∑' },
  { bg: '#A7F3D0', text: '#064E3B', icon: '📐' },
  { bg: '#BAE6FD', text: '#0C4A6E', icon: '🧪' },
  { bg: '#FCA5A5', text: '#7F1D1D', icon: '📗' },
];
const SUBJECT_ICONS: Record<string, string> = { hcv: '⚡', irodov: '🔬', ncert: '📗', dc: '⚗️', sl: '🧮', physics: '⚡', chemistry: '🧪', maths: '∑', math: '∑' };

const bgScore  = (s: number) => s >= 75 ? '#D1FAE5' : s >= 50 ? '#FEF9C3' : '#FEE2E2';
const txtScore = (s: number) => s >= 75 ? '#065F46' : s >= 50 ? '#92400E' : '#991B1B';
const hexScore = (s: number) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avg: 0, unique: 0, last: null });
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
            .limit(20),
        ]);
        const booksData = await booksRes.json();
        setBooks(Array.isArray(booksData) ? booksData : []);
        if (data && data.length > 0) {
          const fmt: AttemptData[] = data.map(a => ({
            title: (a.quizzes as any)?.title || 'Practice set',
            score: a.score ?? 0,
            date: new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            quiz_id: a.quiz_id,
          }));
          setAttempts(fmt);
          const avg = Math.round(fmt.reduce((s, a) => s + a.score, 0) / fmt.length);
          setStats({ total: fmt.length, avg, unique: new Set(fmt.map(a => a.quiz_id)).size, last: fmt[0]?.date ?? null });
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  // Build fake weekly bar data from attempts
  const weekData = DAYS.map((day, i) => ({
    day,
    val: attempts.length > 0 ? Math.round((attempts[i % attempts.length]?.score ?? 0) * 1.4) : 0,
    active: i === 2,
  }));

  const CATS = ['All', 'Physics', 'Chemistry', 'Maths'];
  const CAT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'];

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', background: '#F0F2FA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #DDD6FE', borderTopColor: '#7C3AED', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#7C8DB0', fontSize: 14, fontWeight: 700 }}>Loading…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <div style={{ background: '#F0F2FA', minHeight: 'calc(100vh - 60px)', padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 290px', gap: 16, maxWidth: 1380, margin: '0 auto' }}>

          {/* ─── LEFT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero purple card */}
            <div className="hero-card">
              <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 90, opacity: 0.2 }}>🏆</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Chapter-wise practice</div>
              <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 22, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 8 }}>
                {stats.total > 0 ? `${stats.total} sessions done!` : 'Start practicing now'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 16 }}>
                {stats.total > 0 ? `${stats.unique} unique sets · ${stats.avg}% avg score` : 'Pick a chapter below and go!'}
              </div>
              <button onClick={() => router.push('/')} style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowRight size={18} color="#7C3AED" />
              </button>
            </div>

            {/* Two mini stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="mini-stat" style={{ borderLeft: '4px solid #FFAD5A' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7C8DB0', textTransform: 'uppercase' }}>Attempts</div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 28, color: '#1A1A2E', lineHeight: 1 }}>{stats.total}</div>
              </div>
              <div className="mini-stat" style={{ borderLeft: '4px solid #9B8BF4' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7C8DB0', textTransform: 'uppercase' }}>Avg score</div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 28, color: stats.avg >= 75 ? '#10B981' : stats.avg >= 50 ? '#F59E0B' : '#7C3AED', lineHeight: 1 }}>{stats.total > 0 ? `${stats.avg}%` : '—'}</div>
              </div>
            </div>

            {/* Subject pills */}
            <div className="w-card" style={{ padding: '16px' }}>
              <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#1A1A2E', marginBottom: 12 }}>Subjects</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['⚡ Physics', '🧪 Chemistry', '∑ Maths'].map((s, i) => (
                  <span key={i} className="subj-pill" style={{ fontSize: 12 }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Books — scrollable */}
            <div className="w-card" style={{ padding: '16px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#1A1A2E' }}>Practice Bank</div>
                <MoreHorizontal size={16} color="#B4BAD4" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {books.slice(0, 4).map((book, idx) => {
                  const s = BOOK_STYLES[idx % BOOK_STYLES.length];
                  const key = book.slug.toLowerCase();
                  const icon = Object.entries(SUBJECT_ICONS).find(([k]) => key.includes(k))?.[1] ?? '📘';
                  return (
                    <Link key={book.id} href={`/books/${book.slug}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: s.bg, cursor: 'pointer', transition: 'transform 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)'}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: s.text, fontFamily: 'Nunito, sans-serif' }}>{book.title}</div>
                          <div style={{ fontSize: 11, color: s.text, opacity: 0.65, fontWeight: 700 }}>Practice →</div>
                        </div>
                        <ArrowRight size={14} color={s.text} style={{ opacity: 0.5 }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── CENTER COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Orange progress chart — EduView style */}
            <div className="progress-card">
              {/* Big watermark text */}
              <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Lilita One, cursive', fontSize: 100, color: 'rgba(255,255,255,0.15)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
                {stats.avg > 0 ? `${stats.avg}%` : 'GO!'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 22, color: '#1A1A2E' }}>Progress</div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                    <div><span style={{ fontFamily: 'Lilita One, cursive', fontSize: 28, color: '#1A1A2E' }}>{stats.total}</span><span style={{ fontSize: 13, color: 'rgba(26,26,46,0.6)', fontWeight: 700, marginLeft: 4 }}>sessions</span></div>
                    <div><span style={{ fontFamily: 'Lilita One, cursive', fontSize: 28, color: '#1A1A2E' }}>{stats.unique}</span><span style={{ fontSize: 13, color: 'rgba(26,26,46,0.6)', fontWeight: 700, marginLeft: 4 }}>unique sets</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.4)', borderRadius: 100, padding: '3px' }}>
                  {['Weekly', 'Month'].map((t, i) => (
                    <div key={t} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800, background: i === 0 ? '#FFFFFF' : 'transparent', color: '#1A1A2E', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>{t}</div>
                  ))}
                </div>
              </div>

              {/* Pill bars */}
              <div className="pill-bar-wrap">
                {DAYS.map((day, i) => {
                  const val = attempts.length > 0 ? Math.min(100, (attempts[i % Math.max(attempts.length, 1)]?.score ?? 0)) : [39, 14, 48, 24, 22][i];
                  const heightPct = `${Math.max(15, val)}%`;
                  const isActive = i === 2;
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: '100%', height: 140, background: 'rgba(255,255,255,0.25)', borderRadius: 99, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', height: heightPct, borderRadius: 99, background: isActive ? '#FF6B35' : '#FFFFFF', transition: 'height 1s ease', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 900, color: isActive ? '#FFFFFF' : '#FFAD5A', whiteSpace: 'nowrap' }}>{val}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(26,26,46,0.6)', fontFamily: 'Nunito, sans-serif' }}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent sessions list — like EduView chapter rows */}
            <div className="w-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#1A1A2E' }}>Recent sessions</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['All', 'Physics', 'Chem'].map((c, i) => (
                    <button key={c} onClick={() => setActiveCat(c)} className="cat-pill"
                      style={{ color: activeCat === c ? CAT_COLORS[i] : '#7C8DB0', background: activeCat === c ? `${CAT_COLORS[i]}18` : '#F2F4F8', borderColor: activeCat === c ? `${CAT_COLORS[i]}50` : 'transparent', padding: '5px 12px', fontSize: 12 }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {attempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📖</div>
                  <p style={{ color: '#7C8DB0', fontSize: 14, fontWeight: 800 }}>No sessions yet</p>
                  <p style={{ color: '#B4BAD4', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Pick a book from the left and start!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attempts.slice(0, 5).map((a, i) => (
                    <div key={i} className="chap-row">
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: bgScore(a.score), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {a.score >= 75 ? '🏆' : a.score >= 50 ? '📈' : '📚'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>{a.title.length > 28 ? a.title.slice(0, 28) + '…' : a.title}</div>
                        <div style={{ fontSize: 11, color: '#7C8DB0', fontWeight: 700, marginTop: 2 }}>{a.date}</div>
                      </div>
                      <span className="score-badge" style={{ background: bgScore(a.score), color: txtScore(a.score) }}>{a.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Today's reading header */}
            <div>
              <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 22, color: '#1A1A2E', lineHeight: 1.2, marginBottom: 6 }}>
                Today's practice 📚<br />is ready
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#FFAD5A' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#FFAD5A' }}>Charge your mind</span>
              </div>
            </div>

            {/* Day calendar strip */}
            <div className="w-card" style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {[{d:'Mon',n:20},{d:'Tue',n:21},{d:'Wed',n:22},{d:'Thu',n:23},{d:'Fri',n:24}].map((day, i) => (
                  <div key={day.d} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#B4BAD4', marginBottom: 4 }}>{day.d}</div>
                    <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: i === 2 ? '#7C3AED' : '#1A1A2E', marginBottom: 6 }}>{day.n}</div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 2 ? '#FCA5A5' : i === 2 ? '#A7F3D0' : '#F0F0FA', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                      {i < 2 ? '❌' : i === 2 ? '✅' : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress performance */}
            <div className="w-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#1A1A2E' }}>Performance</div>
                <MoreHorizontal size={16} color="#B4BAD4" style={{ cursor: 'pointer' }} />
              </div>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, marginBottom: 12 }}>
                {['Physics', 'Chem', 'Maths'].map((s, i) => {
                  const colors = ['#FFAD5A', '#9B8BF4', '#CBD5E1'];
                  const heights = [70, 85, 55];
                  return (
                    <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                      <div style={{ width: '100%', height: `${heights[i]}%`, background: colors[i], borderRadius: '6px 6px 0 0' }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {[{l:'Physics',c:'#FFAD5A'},{l:'Chem',c:'#9B8BF4'},{l:'Maths',c:'#CBD5E1'}].map(p => (
                  <div key={p.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.c }} />
                    <span style={{ fontSize: 10, color: '#7C8DB0', fontWeight: 700 }}>{p.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purple streak card */}
            <div style={{ background: '#9B8BF4', borderRadius: 18, padding: '18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ fontSize: 40 }}>📖</div>
              <div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 15, color: '#FFFFFF', marginBottom: 4 }}>Daily practice increases your rank!</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>⭐ Keep your streak going</div>
              </div>
            </div>

            {/* Recommended books */}
            <div className="w-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#1A1A2E' }}>Recommended</div>
                <MoreHorizontal size={16} color="#B4BAD4" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {books.slice(0, 2).map((book, idx) => {
                  const styles = [{ bg: '#FDE68A', text: '#92400E' }, { bg: '#BAE6FD', text: '#0C4A6E' }];
                  const s = styles[idx % 2];
                  return (
                    <Link key={book.id} href={`/books/${book.slug}`}>
                      <div style={{ background: s.bg, borderRadius: 14, padding: '14px 12px', minHeight: 90, cursor: 'pointer', transition: 'transform 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
                      >
                        <div style={{ fontSize: 11, fontWeight: 900, color: s.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Practice</div>
                        <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 13, color: s.text, lineHeight: 1.2 }}>{book.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const CAT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'];
