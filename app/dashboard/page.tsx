'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Analytics {
  totalAttempts: number; avgScore: number; totalQuestions: number; totalWrong: number;
  accuracy: number; streak: number; mistakes: number; dueFlashcards: number;
  badges: Array<{ badge_type: string; earned_at: string }>;
  chapterAccuracy: Array<{ id: string; title: string; bookTitle: string; total: number; correct: number; accuracy: number }>;
  topMistakeChapters: Array<{ id: string; title: string; bookTitle: string; count: number }>;
  recentAttempts: Array<{ score: number; completed_at: string; quiz_id: string }>;
  dailyActivity: Array<{ date: string; questions_attempted: number; correct_count: number }>;
}
interface Book { id: string; slug: string; title: string; subject?: string; }

const BADGE_META: Record<string, { icon: string; label: string }> = {
  first_attempt: { icon: '🚀', label: 'First Step' },
  century: { icon: '💯', label: 'Century' },
  perfectionist: { icon: '⭐', label: 'Perfect Score' },
  streak_7: { icon: '🔥', label: '7-Day Streak' },
};

function scoreColor(s: number) { return s >= 75 ? 'var(--lime)' : s >= 50 ? 'var(--yellow)' : 'var(--coral)'; }
function scoreBadgeClass(s: number) { return s >= 75 ? 'badge-lime' : s >= 50 ? 'badge-yellow' : 'badge-coral'; }

const BOOK_GRADIENTS = [
  'linear-gradient(135deg, #f5c842 0%, #fb923c 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
  'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #f472b6 0%, #f87171 100%)',
  'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
];

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const [booksRes, analyticsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      ]);
      setBooks(await booksRes.json());
      setAnalytics(await analyticsRes.json());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [session?.access_token]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    fetchData();
  }, [user, loading, fetchData, router]);

  const name = user?.email?.split('@')[0] ?? 'Student';
  const a = analytics;

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const act = a?.dailyActivity?.find(x => x.date === key);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2), date: key, count: act?.questions_attempted ?? 0, correct: act?.correct_count ?? 0 };
  });
  const maxDay = Math.max(...days7.map(d => d.count), 1);

  if (loading) return (
    <div className="app-shell">
      <Navigation />
      <div className="main-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--surface3)', borderTopColor: 'var(--yellow)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Navigation />
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Welcome back, {name} 👋</div>
          </div>
          <div className="topbar-right">
            {a?.dueFlashcards ? (
              <Link href="/flashcards" className="badge badge-coral" style={{ fontSize: 12, gap: 6, padding: '5px 12px' }}>
                📚 {a.dueFlashcards} cards due
              </Link>
            ) : null}
            {a?.badges?.map(b => (
              <span key={b.badge_type} title={BADGE_META[b.badge_type]?.label} style={{ fontSize: 20 }}>
                {BADGE_META[b.badge_type]?.icon ?? '🏅'}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* STAT TILES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { val: isLoading ? '…' : String(a?.totalQuestions ?? 0), lbl: 'Questions done', sub: `${a?.totalAttempts ?? 0} sessions`, glow: 'var(--yellow)', icon: '📝' },
              { val: isLoading ? '…' : a?.accuracy != null ? `${a.accuracy}%` : '—', lbl: 'Overall accuracy', sub: `${a?.totalWrong ?? 0} wrong answers`, glow: 'var(--lime)', icon: '🎯' },
              { val: isLoading ? '…' : String(a?.mistakes ?? 0), lbl: 'Active mistakes', sub: 'in notebook', glow: 'var(--coral)', icon: '❌', link: '/mistakes' },
              { val: isLoading ? '…' : `${a?.streak ?? 0}d`, lbl: 'Current streak', sub: a?.streak ? 'keep going! 🔥' : 'start practicing', glow: 'var(--orange)', icon: '🔥' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ cursor: s.link ? 'pointer' : 'default' }} onClick={() => s.link && router.push(s.link)}>
                <div className="stat-card-glow" style={{ background: s.glow }} />
                <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                <div className="stat-card-val" style={{ color: s.glow }}>{s.val}</div>
                <div className="stat-card-lbl">{s.lbl}</div>
                <div className="stat-card-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Chapter accuracy */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Chapter Accuracy</div>
                <Link href="/mistakes" style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 600 }}>Full analysis →</Link>
              </div>
              {isLoading || !a?.chapterAccuracy?.length ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>Practice to see accuracy</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {a.chapterAccuracy.slice(0, 6).map(c => (
                    <div key={c.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{c.title}</div>
                          <div style={{ fontSize: 10, color: 'var(--faint)' }}>{c.bookTitle} · {c.total}Q</div>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: scoreColor(c.accuracy) }}>{c.accuracy}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${c.accuracy}%`, background: scoreColor(c.accuracy) }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7-day activity */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>7-day Activity</div>
                <span className="badge badge-yellow">{a?.streak ?? 0} day streak</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100, marginBottom: 8 }}>
                {days7.map(d => (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ background: d.count > 0 ? 'var(--yellow)' : 'var(--surface3)', borderRadius: 4, height: `${Math.max(4, (d.count / maxDay) * 80)}px`, opacity: d.count > 0 ? 1 : 0.4, transition: 'height 0.5s', position: 'relative', overflow: 'hidden' }}>
                        {d.count > 0 && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)' }} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--faint)', fontWeight: 600 }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {[
                  { lbl: 'Total Q', val: days7.reduce((s,d)=>s+d.count,0) },
                  { lbl: 'Correct', val: days7.reduce((s,d)=>s+d.correct,0) },
                  { lbl: 'Acc %', val: days7.reduce((s,d)=>s+d.count,0) > 0 ? `${Math.round((days7.reduce((s,d)=>s+d.correct,0)/days7.reduce((s,d)=>s+d.count,0))*100)}%` : '—' },
                ].map(m => (
                  <div key={m.lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{m.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>{m.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOOKS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Practice Bank</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{books.length} books</span>
            </div>
            {books.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--faint)' }}>
                No books yet — add via Admin
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {books.map((b, i) => (
                  <Link key={b.id} href={`/books/${b.slug}`}>
                    <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid var(--border)', background: 'var(--surface)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
                      <div style={{ height: 80, background: BOOK_GRADIENTS[i % BOOK_GRADIENTS.length], position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: 'rgba(0,0,0,0.2)' }}>
                          {b.title.slice(0, 3).toUpperCase()}
                        </div>
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{b.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.subject ?? 'Practice'} →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Weak chapters */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Weakest Chapters</div>
                <Link href="/mistakes" className="badge badge-coral" style={{ padding: '4px 10px', fontSize: 11 }}>Notebook →</Link>
              </div>
              {!a?.topMistakeChapters?.length ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No mistakes yet 🎉</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {a.topMistakeChapters.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < a.topMistakeChapters.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--coral)' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--faint)' }}>{c.bookTitle}</div>
                      </div>
                      <span className="badge badge-coral" style={{ fontFamily: 'JetBrains Mono, monospace' }}>✗ {c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sessions */}
            <div className="glass-card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent Sessions</div>
              {!a?.recentAttempts?.length ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No sessions yet — start practicing!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {a.recentAttempts.slice(0, 6).map((att, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{new Date(att.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>Practice session</div>
                      </div>
                      <span className={`score-pill ${scoreBadgeClass(att.score)}`} style={{ border: '1px solid currentColor' }}>{att.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/mistakes" className="btn-ghost" style={{ fontSize: 13 }}>📕 Mistake Notebook</Link>
            <Link href="/flashcards" className="btn-ghost" style={{ fontSize: 13 }}>📚 Flashcards {a?.dueFlashcards ? `(${a.dueFlashcards} due)` : ''}</Link>
            <Link href="/diagram" className="btn-ghost" style={{ fontSize: 13 }}>△ Diagram Lab</Link>
            {isAdmin && <Link href="/admin" className="btn-ghost" style={{ fontSize: 13 }}>⚙ Admin</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
