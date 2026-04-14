'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface AnalyticsData {
  totalAttempts: number; avgScore: number; totalQuestions: number; totalWrong: number;
  accuracy: number; streak: number; mistakes: number; dueFlashcards: number;
  badges: Array<{ badge_type: string; earned_at: string }>;
  chapterAccuracy: Array<{ id: string; title: string; bookTitle: string; total: number; correct: number; accuracy: number }>;
  topMistakeChapters: Array<{ id: string; title: string; bookTitle: string; count: number }>;
  recentAttempts: Array<{ score: number; completed_at: string }>;
  dailyActivity: Array<{ date: string; questions_attempted: number; correct_count: number }>;
}

interface Book { id: string; slug: string; title: string; }

const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  first_attempt: { label: 'First Step', icon: '🚀', color: '#3d9eff' },
  century: { label: 'Century', icon: '💯', color: '#f5d90a' },
  perfectionist: { label: 'Perfectionist', icon: '⭐', color: '#b8f72b' },
  streak_7: { label: '7-Day Streak', icon: '🔥', color: '#ff7a00' },
};

const BCOLORS: Record<string, string> = { hcv: '#f5d90a', irodov: '#ff7a00', ncert: '#0fd68a', dc: '#3d9eff', sl: '#ff6fd8', vk: '#ff4d4d', ms: '#b06ef3', cengage: '#b8f72b' };
function bColor(slug: string) { for (const k of Object.keys(BCOLORS)) { if (slug.toLowerCase().includes(k)) return BCOLORS[k]; } return '#f5d90a'; }
function bShort(title: string) { const m: Record<string, string> = { hcv: 'HCV', irodov: 'IRD', ncert: 'NCRT', dc: 'DCP', sl: 'SL', vk: 'VKJ', ms: 'MSC', cengage: 'CNG' }; for (const k of Object.keys(m)) { if (title.toLowerCase().includes(k)) return m[k]; } return title.slice(0, 3).toUpperCase(); }
const bgScore = (s: number) => s >= 75 ? '#b8f72b' : s >= 50 ? '#f5d90a' : '#ff4d4d';
const tcScore = (s: number) => s >= 50 ? '#0a0a0a' : '#fff';

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const [booksRes, analyticsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      ]);
      const bd = await booksRes.json();
      const ad = await analyticsRes.json();
      setBooks(Array.isArray(bd) ? bd : []);
      setAnalytics(ad);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [session?.access_token]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    fetchData();
  }, [user, loading, fetchData, router]);

  const name = user?.email?.split('@')[0] ?? 'Student';
  const ini = user?.email?.slice(0, 2).toUpperCase() ?? 'JE';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;

  if (loading) return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #333', borderTopColor: '#f5d90a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );

  const a = analytics;

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        {/* Topbar */}
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#f5d90a' }} />
            <span className="neo-topbar-title">Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {a?.dueFlashcards ? (
              <Link href="/flashcards" style={{ background: '#ff4d4d', border: '2px solid #0a0a0a', padding: '5px 12px', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                📚 {a.dueFlashcards} DUE
              </Link>
            ) : null}
            <div style={{ padding: '6px 14px', background: '#0a0a0a', color: '#f5d90a', fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700 }}>{ini}</div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Greeting */}
          <div style={{ background: '#f5d90a', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a', padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 4 }}>// WELCOME BACK</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.5px' }}>Good day, {name}! 📐</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {a?.badges?.map(b => (
                <div key={b.badge_type} title={BADGE_INFO[b.badge_type]?.label ?? b.badge_type} style={{ fontSize: 24 }}>
                  {BADGE_INFO[b.badge_type]?.icon ?? '🏅'}
                </div>
              ))}
              {a?.streak ? <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>🔥 {a.streak}d</div> : null}
            </div>
          </div>

          {/* Stat tiles */}
          <div className="neo-stats-grid" style={{ marginBottom: 24, border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a' }}>
            {[
              { val: isLoading ? '…' : String(a?.totalQuestions ?? 0), lbl: 'Questions done', color: 'yellow', ico: '📝' },
              { val: isLoading ? '…' : a?.accuracy != null ? `${a.accuracy}%` : '—', lbl: 'Overall accuracy', color: 'lime', ico: '🎯' },
              { val: isLoading ? '…' : String(a?.mistakes ?? 0), lbl: 'In mistake book', color: 'coral', ico: '❌' },
              { val: isLoading ? '…' : String(a?.dueFlashcards ?? 0), lbl: 'Cards due today', color: 'sky', ico: '📚' },
            ].map((s, i) => (
              <div key={i} className={`neo-stat-tile ${s.color}`}>
                <div className="neo-stat-ico">{s.ico}</div>
                <div className="neo-stat-lbl">{s.lbl}</div>
                <div className="neo-stat-val">{s.val}</div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Books */}
            <div>
              <div className="neo-sec-head"><div className="neo-sec-title">Practice Bank</div><Link href="/" style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#666' }}>All →</Link></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {books.slice(0, 4).map(b => (
                  <Link key={b.id} href={`/books/${b.slug}`}>
                    <div className="neo-book-tile">
                      <div className="neo-book-spine" style={{ background: bColor(b.slug) }}>{bShort(b.title)}</div>
                      <div className="neo-book-name">{b.title}</div>
                      <div className="neo-book-tag">Practice →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Chapter accuracy heatmap */}
            <div>
              <div className="neo-sec-head"><div className="neo-sec-title">Chapter Accuracy</div></div>
              {isLoading ? (
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 24, textAlign: 'center', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#999' }}>Loading…</div>
              ) : !a?.chapterAccuracy?.length ? (
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 24, textAlign: 'center', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#999' }}>Practice first to see accuracy</div>
              ) : (
                <div style={{ border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', overflow: 'hidden', background: '#fff' }}>
                  {a.chapterAccuracy.slice(0, 6).map((c, i, arr) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < arr.length - 1 ? '2px solid #eee' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: '#999' }}>{c.bookTitle} · {c.total} Q</div>
                      </div>
                      <div style={{ width: 100, height: 8, background: '#f0f0f0', border: '1px solid #ddd' }}>
                        <div style={{ height: '100%', width: `${c.accuracy}%`, background: c.accuracy >= 75 ? '#b8f72b' : c.accuracy >= 50 ? '#f5d90a' : '#ff4d4d', transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, width: 40, textAlign: 'right', color: c.accuracy >= 75 ? '#0a0a0a' : c.accuracy >= 50 ? '#0a0a0a' : '#ff4d4d' }}>{c.accuracy}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: mistakes + recent + week */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Top mistake chapters */}
            <div>
              <div className="neo-sec-head">
                <div className="neo-sec-title">Weak Chapters</div>
                <Link href="/mistakes" style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#ff4d4d' }}>Notebook →</Link>
              </div>
              {!a?.topMistakeChapters?.length ? (
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 16, fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#999', textAlign: 'center' }}>No mistakes yet!</div>
              ) : (
                <div style={{ border: '3px solid #0a0a0a', overflow: 'hidden', background: '#fff' }}>
                  {a.topMistakeChapters.map((c, i, arr) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '2px solid #eee' : 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div>
                      <div style={{ background: '#ff4d4d', border: '2px solid #0a0a0a', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#fff' }}>✗ {c.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent attempts */}
            <div>
              <div className="neo-sec-head"><div className="neo-sec-title">Recent</div></div>
              {!a?.recentAttempts?.length ? (
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 16, fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#999', textAlign: 'center' }}>No attempts yet</div>
              ) : (
                <div style={{ border: '3px solid #0a0a0a', overflow: 'hidden', background: '#fff' }}>
                  {a.recentAttempts.slice(0, 5).map((att, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '2px solid #eee' : 'none' }}>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#999' }}>{new Date(att.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div className="neo-score-badge" style={{ background: bgScore(att.score), color: tcScore(att.score) }}>{att.score}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Week calendar */}
            <div>
              <div className="neo-sec-head"><div className="neo-sec-title">This Week</div><div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#777' }}>🔥 {a?.streak ?? 0}d streak</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0, border: '3px solid #0a0a0a', overflow: 'hidden' }}>
                {days.map((d, i) => {
                  const todayDay = (new Date().getDay() + 6) % 7;
                  const done = i < todayDay; const today = i === todayDay;
                  return (
                    <div key={d} style={{ textAlign: 'center', padding: '10px 4px', borderRight: i < 6 ? '2px solid #eee' : 'none', background: today ? '#f5d90a' : done ? '#0a0a0a' : '#fafafa' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: today ? '#0a0a0a' : done ? '#f5d90a' : '#bbb', marginBottom: 6 }}>{d}</div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, color: today ? '#0a0a0a' : done ? '#fff' : '#ddd' }}>{done ? '✓' : today ? '●' : '○'}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link href="/mistakes" className="neu-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px', background: '#ff4d4d', color: '#fff' }}>Mistake Book</Link>
                <Link href="/flashcards" className="neu-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px', background: '#3d9eff', color: '#fff' }}>Flashcards</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
