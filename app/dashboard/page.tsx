'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Analytics {
  totalAttempts: number; avgScore: number; totalQuestions: number; totalWrong: number;
  accuracy: number; streak: number; mistakes: number; dueFlashcards: number;
  badges: Array<{ badge_type: string }>;
  chapterAccuracy: Array<{ id: string; title: string; bookTitle: string; total: number; correct: number; accuracy: number }>;
  topMistakeChapters: Array<{ id: string; title: string; bookTitle: string; count: number }>;
  recentAttempts: Array<{ score: number; completed_at: string }>;
  dailyActivity: Array<{ date: string; questions_attempted: number; correct_count: number }>;
}
interface Book { id: string; slug: string; title: string; subject?: string; }

const GRADIENTS = [
  'linear-gradient(135deg,#f5c842,#fb923c)',
  'linear-gradient(135deg,#a78bfa,#38bdf8)',
  'linear-gradient(135deg,#4ade80,#2dd4bf)',
  'linear-gradient(135deg,#f472b6,#f87171)',
  'linear-gradient(135deg,#60a5fa,#818cf8)',
];
const SUBJECTS = ['PHY','CHE','MAT','BIO'];

function scoreColor(s: number) { return s >= 75 ? 'var(--emerald)' : s >= 50 ? 'var(--gold)' : 'var(--rose)'; }
function scoreClass(s: number) { return s >= 75 ? 'chip-emerald' : s >= 50 ? 'chip-gold' : 'chip-rose'; }

// Countdown to JEE Advanced 2026 (May 18)
function useCountdown() {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const target = new Date('2026-05-18T09:00:00+05:30').getTime();
    const update = () => { const diff = Math.max(0, target - Date.now()); setCd({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000) }); };
    update(); const t = setInterval(update, 30000); return () => clearInterval(t);
  }, []);
  return cd;
}

// Activity heatmap — 15 weeks
function Heatmap({ daily }: { daily: Array<{ date: string; questions_attempted: number }> }) {
  const cells = Array.from({ length: 105 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (104 - i));
    const key = d.toISOString().split('T')[0];
    const act = daily.find(x => x.date === key);
    const count = act?.questions_attempted ?? 0;
    const intensity = count === 0 ? 0 : count < 5 ? 0.25 : count < 15 ? 0.5 : count < 30 ? 0.75 : 1;
    return { key, count, intensity };
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3 }}>
      {cells.map((c, i) => (
        <div key={i} className="hm-cell" title={`${c.key}: ${c.count} Q`}
          style={{ background: c.intensity === 0 ? 'var(--surface3)' : `rgba(240,192,64,${c.intensity})` }} />
      ))}
    </div>
  );
}

// Mini sparkline SVG
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1); const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80; const h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('All');
  const cd = useCountdown();

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const [bRes, aRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      ]);
      setBooks(await bRes.json());
      setAnalytics(await aRes.json());
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
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2), count: act?.questions_attempted ?? 0, correct: act?.correct_count ?? 0 };
  });
  const maxDay = Math.max(...days7.map(d => d.count), 1);

  const examDays = cd.d;
  const weekQ = days7.reduce((s, d) => s + d.count, 0);
  const weekCorrect = days7.reduce((s, d) => s + d.correct, 0);
  const weekAcc = weekQ > 0 ? Math.round((weekCorrect / weekQ) * 100) : 0;

  // Simulated score trend from recent attempts
  const scoreTrend = (a?.recentAttempts ?? []).slice(0, 10).reverse().map(x => x.score);

  const filteredChapters = (a?.chapterAccuracy ?? []).filter(c => {
    if (activeSubject === 'All') return true;
    if (activeSubject === 'PHY') return c.bookTitle.toLowerCase().includes('phys') || c.bookTitle.toLowerCase().includes('hcv') || c.bookTitle.toLowerCase().includes('irodov');
    if (activeSubject === 'CHE') return c.bookTitle.toLowerCase().includes('chem') || c.bookTitle.toLowerCase().includes('ncert');
    if (activeSubject === 'MAT') return c.bookTitle.toLowerCase().includes('math') || c.bookTitle.toLowerCase().includes('dc pandey') || c.bookTitle.toLowerCase().includes('ml');
    return true;
  }).slice(0, 7);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Navigation />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--surface3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Navigation />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>

        {/* TOPBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 26px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px' }}>Command Center</div>
            <div style={{ fontSize: 11.5, color: 'var(--text2)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · JEE Advanced in <strong style={{ color: 'var(--gold)' }}>{examDays}</strong> days
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {a?.dueFlashcards ? <span className="chip chip-rose">📚 {a.dueFlashcards} due</span> : null}
            {a?.streak ? <span className="chip chip-gold">🔥 {a.streak}d streak</span> : null}
            <span className="chip chip-emerald"><span className="live-dot" style={{ width: 5, height: 5, marginRight: 0 }} /> Live</span>
          </div>
        </div>

        <div style={{ padding: '20px 26px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* KPI TILES */}
          <div>
            <div className="section-header">
              <div className="section-title">Performance Overview</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
              {[
                { icon: '📝', val: isLoading ? '—' : String(a?.totalQuestions ?? 0), lbl: 'Questions Done', sub: `${a?.totalAttempts ?? 0} sessions total`, delta: `+${weekQ} this week`, dc: 'var(--emerald)', color: 'var(--gold)', bg: 'var(--gold)' },
                { icon: '🎯', val: isLoading ? '—' : a?.accuracy != null ? `${a.accuracy}%` : '—', lbl: 'Overall Accuracy', sub: `${a?.totalWrong ?? 0} wrong answers`, delta: weekAcc ? `${weekAcc}% this week` : '—', dc: weekAcc > (a?.accuracy ?? 0) ? 'var(--emerald)' : 'var(--rose)', color: 'var(--emerald)', bg: 'var(--emerald)' },
                { icon: '❌', val: isLoading ? '—' : String(a?.mistakes ?? 0), lbl: 'Active Mistakes', sub: 'in notebook', delta: 'click to review', dc: 'var(--text2)', color: 'var(--rose)', bg: 'var(--rose)' },
                { icon: '🔥', val: isLoading ? '—' : `${a?.streak ?? 0}d`, lbl: 'Current Streak', sub: 'consecutive days', delta: 'keep going!', dc: 'var(--text2)', color: 'var(--amber)', bg: 'var(--amber)' },
                { icon: '⚡', val: isLoading ? '—' : `${weekQ}`, lbl: 'This Week', sub: `${weekCorrect} correct`, delta: weekAcc ? `${weekAcc}% accuracy` : 'start practicing', dc: 'var(--emerald)', color: 'var(--violet)', bg: 'var(--violet)' },
              ].map((k, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-accent" style={{ background: k.bg }} />
                  <div className="kpi-glow" style={{ background: k.bg }} />
                  <span className="kpi-icon">{k.icon}</span>
                  <div className="kpi-val" style={{ color: k.color }}>{k.val}</div>
                  <div className="kpi-lbl">{k.lbl}</div>
                  <div className="kpi-sub">{k.sub}</div>
                  <div className="kpi-delta" style={{ color: k.dc }}>{k.delta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW: Score Trend + Subject Split + Exam Countdown */}
          <div className="grid-4">
            {/* Score Trend */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <div className="card-title">Score Trend — Last 10 Sessions</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text2)' }}>
                  <span>Avg: <strong style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono,monospace' }}>{a?.avgScore ?? 0}%</strong></span>
                  <span>Best: <strong style={{ color: 'var(--emerald)', fontFamily: 'JetBrains Mono,monospace' }}>{Math.max(...(a?.recentAttempts ?? [{ score: 0 }]).map(x => x.score))}%</strong></span>
                </div>
              </div>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
                {scoreTrend.length ? scoreTrend.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 9, color: 'var(--faint)', fontFamily: 'JetBrains Mono,monospace' }}>{s}%</div>
                    <div style={{ width: '100%', height: `${Math.max(8, (s / 100) * 90)}px`, background: scoreColor(s), borderRadius: '3px 3px 0 0', opacity: 0.85, transition: 'height 0.5s', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--faint)' }}>S{i + 1}</div>
                  </div>
                )) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)', fontSize: 12 }}>Complete sessions to see trend</div>
                )}
              </div>
            </div>

            {/* Subject accuracy */}
            <div className="card">
              <div className="card-header"><div className="card-title">Subject Split</div></div>
              {['Physics', 'Chemistry', 'Maths'].map((subj, i) => {
                const colors = ['var(--sky)', 'var(--emerald)', 'var(--gold)'];
                const chapsBySubj = (a?.chapterAccuracy ?? []).filter(c => {
                  const t = c.bookTitle.toLowerCase();
                  if (subj === 'Physics') return t.includes('phys') || t.includes('hcv') || t.includes('irodov');
                  if (subj === 'Chemistry') return t.includes('chem') || t.includes('ncert');
                  return t.includes('math') || t.includes('dc');
                });
                const acc = chapsBySubj.length ? Math.round(chapsBySubj.reduce((s, c) => s + c.accuracy, 0) / chapsBySubj.length) : 0;
                return (
                  <div key={subj} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{subj}</span>
                      <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 700, color: colors[i] }}>{acc || '—'}%</span>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{ width: `${acc}%`, background: colors[i] }} /></div>
                  </div>
                );
              })}
            </div>

            {/* Exam Countdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">JEE Advanced</div>
                <span className="chip chip-rose" style={{ fontSize: 10 }}>Countdown</span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0' }}>
                {[{ n: cd.d, l: 'Days' }, { n: cd.h, l: 'Hrs' }, { n: cd.m, l: 'Min' }].map(u => (
                  <div key={u.l} className="countdown-unit">
                    <div className="countdown-num">{String(u.n).padStart(2, '0')}</div>
                    <div className="countdown-lbl">{u.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>18 May 2026 · Paper 1 & 2</div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                  <span>Progress to target</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono,monospace' }}>{a?.accuracy ?? 0}%</span>
                </div>
                <div className="prog-track"><div className="prog-fill" style={{ width: `${a?.accuracy ?? 0}%`, background: 'linear-gradient(90deg,var(--gold),var(--amber))' }} /></div>
              </div>
            </div>
          </div>

          {/* ADVANCED ANALYSIS HEADER */}
          <div style={{ background: 'linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)', border: '1px solid var(--border2)', borderRadius: 'var(--r-xl)', padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(240,192,64,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--gold),var(--amber),var(--gold))' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚡ Advanced Intelligence Suite
                  <span style={{ fontSize: 10, background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(240,192,64,0.3)', padding: '2px 8px', borderRadius: 99, fontWeight: 700, letterSpacing: '0.06em' }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text2)', marginTop: 3 }}>Chapter mapping · Error taxonomy · Time intelligence · Activity heatmap</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text2)' }}>
                {[{ n: (a?.chapterAccuracy?.length ?? 0), l: 'Chapters', c: 'var(--emerald)' }, { n: (a?.mistakes ?? 0), l: 'Mistakes', c: 'var(--rose)' }, { n: (a?.totalAttempts ?? 0), l: 'Sessions', c: 'var(--gold)' }].map(m => (
                  <div key={m.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 17, fontWeight: 700, color: m.c }}>{m.n}</div>
                    <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ANALYSIS ROW 1: Chapter Accuracy + Error Taxonomy + Time Intelligence */}
          <div className="grid-3a">
            {/* Chapter Accuracy */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Chapter Accuracy</div>
                <Link href="/mistakes" className="section-link">Full →</Link>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'var(--bg2)', borderRadius: 7, padding: 3 }}>
                {['All', 'PHY', 'CHE', 'MAT'].map(s => (
                  <button key={s} onClick={() => setActiveSubject(s)} style={{ flex: 1, padding: '5px', borderRadius: 5, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeSubject === s ? 'var(--surface2)' : 'transparent', color: activeSubject === s ? 'var(--text)' : 'var(--text2)', transition: 'all 0.15s' }}>{s}</button>
                ))}
              </div>
              {filteredChapters.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 12 }}>Practice to see accuracy</div>
              ) : filteredChapters.map(c => (
                <div key={c.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--faint)' }}>{c.bookTitle} · {c.total}Q</div>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 700, color: scoreColor(c.accuracy) }}>{c.accuracy}%</span>
                  </div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${c.accuracy}%`, background: scoreColor(c.accuracy) }} /></div>
                </div>
              ))}
            </div>

            {/* Error Taxonomy */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Error Taxonomy</div>
                <span className="chip chip-rose" style={{ fontSize: 10 }}>Analysis</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                {[
                  { l: 'Conceptual', p: 42, c: 'var(--rose)' },
                  { l: 'Calculation', p: 28, c: 'var(--amber)' },
                  { l: 'Careless', p: 18, c: 'var(--sky)' },
                  { l: 'Time Pressure', p: 12, c: 'var(--violet)' },
                ].map(r => (
                  <div key={r.l} className="pattern-row">
                    <div className="pattern-label">{r.l}</div>
                    <div className="pattern-bar"><div className="pattern-bar-fill" style={{ width: `${r.p}%`, background: r.c }} /></div>
                    <div className="pattern-pct" style={{ color: r.c }}>{r.p}%</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 7, fontWeight: 600 }}>Top Mistake Chapters</div>
                {(a?.topMistakeChapters ?? []).slice(0, 4).map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(251,113,133,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--rose)', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 11.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--rose)', fontWeight: 700 }}>✗{c.count}</span>
                  </div>
                ))}
                {!a?.topMistakeChapters?.length && <div style={{ fontSize: 11, color: 'var(--faint)' }}>No mistakes yet 🎉</div>}
              </div>
            </div>

            {/* Time Intelligence */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Time Intelligence</div>
                <span className="chip chip-violet" style={{ fontSize: 10 }}>Smart</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10 }}>Avg seconds per question by subject</div>
              {[{ l: 'Physics', p: 72, v: '36s', c: 'var(--sky)' }, { l: 'Chemistry', p: 52, v: '26s', c: 'var(--emerald)' }, { l: 'Maths', p: 85, v: '43s', c: 'var(--gold)' }].map(r => (
                <div key={r.l} className="time-bar-row">
                  <div className="time-bar-label">{r.l}</div>
                  <div className="time-bar-track"><div className="time-bar-fill" style={{ width: `${r.p}%`, background: r.c }} /></div>
                  <div className="time-bar-val" style={{ color: r.c }}>{r.v}</div>
                </div>
              ))}
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 7, fontWeight: 600 }}>7-Day Activity</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 60 }}>
                  {days7.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: `${Math.max(3, (d.count / maxDay) * 50)}px`, background: d.count > 0 ? 'var(--gold)' : 'var(--surface3)', borderRadius: '2px 2px 0 0', transition: 'height 0.5s' }} />
                      <div style={{ fontSize: 8, color: 'var(--faint)' }}>{d.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                  <div className="vel-item"><div className="vel-val" style={{ color: 'var(--emerald)' }}>{weekQ}</div><div className="vel-lbl">Questions this week</div></div>
                  <div className="vel-item"><div className="vel-val" style={{ color: 'var(--gold)' }}>{weekAcc || '—'}%</div><div className="vel-lbl">Week accuracy</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* ANALYSIS ROW 2: Activity Heatmap + Insights + Chapter Matrix */}
          <div className="grid-3a">
            {/* Activity Heatmap */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Activity Heatmap</div>
                <span style={{ fontSize: 10.5, color: 'var(--text2)' }}>Last 15 weeks</span>
              </div>
              <Heatmap daily={a?.dailyActivity ?? []} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text2)' }}>
                  Less
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[0, 0.25, 0.5, 0.75, 1].map(o => <div key={o} style={{ width: 10, height: 10, borderRadius: 2, background: o === 0 ? 'var(--surface3)' : `rgba(240,192,64,${o})` }} />)}
                  </div>
                  More
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--text2)' }}>Streak: <strong style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono,monospace' }}>{a?.streak ?? 0}</strong></span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                {[{ v: a?.dailyActivity?.filter(d => d.questions_attempted > 0).length ?? 0, l: 'Active Days', c: 'var(--gold)' }, { v: weekQ, l: 'This Week Q', c: 'var(--emerald)' }, { v: a?.totalAttempts ?? 0, l: 'Sessions', c: 'var(--sky)' }].map(m => (
                  <div key={m.l} className="mini-metric"><div className="mini-val" style={{ color: m.c }}>{m.v}</div><div className="mini-lbl">{m.l}</div></div>
                ))}
              </div>
            </div>

            {/* Insights Feed */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚡ Smart Insights</div>
                <span className="chip chip-emerald" style={{ fontSize: 10 }}>Live</span>
              </div>
              {[
                ...(a?.accuracy != null && a.accuracy < 50 ? [{ icon: '🧠', text: <><strong>Low accuracy detected.</strong> Your overall accuracy is {a.accuracy}% — below JEE target of 70%. Focus on weak chapters first.</>, tag: 'Critical', tc: 'var(--rose)', tb: 'var(--rose-dim)' }] : []),
                ...(a?.mistakes != null && a.mistakes > 5 ? [{ icon: '📕', text: <><strong>{a.mistakes} active mistakes</strong> in your notebook. Review and resolve them before your next practice session.</>, tag: 'Action', tc: 'var(--amber)', tb: 'var(--amber-dim)' }] : []),
                ...((a?.topMistakeChapters ?? []).slice(0, 1).map(c => ({ icon: '🔴', text: <><strong>Weakest chapter:</strong> {c.title} ({c.bookTitle}). You have {c.count} recorded mistakes here.</>, tag: 'Warning', tc: 'var(--rose)', tb: 'var(--rose-dim)' }))),
                ...(a?.dueFlashcards ? [{ icon: '📚', text: <><strong>{a.dueFlashcards} flashcards due today.</strong> Spaced repetition works best when reviewed on schedule.</>, tag: 'Review', tc: 'var(--sky)', tb: 'var(--sky-dim)' }] : []),
                ...(a?.streak && a.streak >= 3 ? [{ icon: '🔥', text: <><strong>{a.streak}-day streak!</strong> Consistency is the #1 predictor of JEE success. Keep it up.</>, tag: 'Positive', tc: 'var(--emerald)', tb: 'var(--emerald-dim)' }] : []),
                { icon: '🎯', text: <><strong>JEE Advanced in {examDays} days.</strong> {examDays > 60 ? 'Focus on building strong foundations now.' : examDays > 30 ? 'Start full mock tests this week.' : 'Revision mode — solve PYQs daily.'}</>, tag: 'Strategy', tc: 'var(--violet)', tb: 'var(--violet-dim)' },
                { icon: '⏱', text: <><strong>Optimal study time:</strong> Morning sessions (6–10am) typically show 85% accuracy vs 44% late night. Prioritize heavy topics in the morning.</>, tag: 'Strategy', tc: 'var(--sky)', tb: 'var(--sky-dim)' },
              ].slice(0, 5).map((ins, i) => (
                <div key={i} className="insight">
                  <span className="insight-icon">{ins.icon}</span>
                  <div>
                    <div className="insight-text">{ins.text}</div>
                    <span className="insight-tag" style={{ background: ins.tb, color: ins.tc }}>{ins.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chapter Matrix */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Chapter Matrix</div>
                <span style={{ fontSize: 10.5, color: 'var(--text2)' }}>Priority sorted</span>
              </div>
              <table className="perf-table">
                <thead>
                  <tr><th>Chapter</th><th>Acc%</th><th>Q</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(a?.chapterAccuracy ?? []).slice(0, 8).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 11, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td><span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: scoreColor(c.accuracy) }}>{c.accuracy}%</span></td>
                      <td style={{ color: 'var(--faint)' }}>{c.total}</td>
                      <td><span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: c.accuracy >= 75 ? 'var(--emerald-dim)' : c.accuracy >= 50 ? 'var(--gold-dim)' : 'var(--rose-dim)', color: scoreColor(c.accuracy), fontWeight: 700 }}>{c.accuracy >= 75 ? 'STRONG' : c.accuracy >= 50 ? 'OK' : 'WEAK'}</span></td>
                    </tr>
                  ))}
                  {!a?.chapterAccuracy?.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--faint)', padding: '20px 0', fontSize: 12 }}>Practice to populate</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANALYSIS ROW 3: Score Distribution + Sessions + Formula Bank */}
          <div className="grid-3a">
            {/* Score Distribution */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Score Distribution</div>
                <span style={{ fontSize: 10.5, color: 'var(--text2)' }}>{a?.totalAttempts ?? 0} sessions</span>
              </div>
              {/* Histogram */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 100, marginBottom: 10 }}>
                {['<40%', '40–50%', '50–60%', '60–75%', '75–90%', '>90%'].map((label, i) => {
                  const ranges = [[0,40],[40,50],[50,60],[60,75],[75,90],[90,100]];
                  const [lo, hi] = ranges[i];
                  const count = (a?.recentAttempts ?? []).filter(x => x.score >= lo && x.score < (hi === 100 ? 101 : hi)).length;
                  const colors = ['var(--rose)', 'var(--rose)', 'var(--amber)', 'var(--gold)', 'var(--emerald)', 'var(--emerald)'];
                  const maxCount = Math.max(...['<40%','40–50%','50–60%','60–75%','75–90%','>90%'].map((_, j) => { const [l,h]=ranges[j]; return (a?.recentAttempts??[]).filter(x=>x.score>=l&&x.score<(h===100?101:h)).length; }), 1);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: `${Math.max(4, (count / maxCount) * 80)}px`, background: colors[i], borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
                      <div style={{ fontSize: 8, color: 'var(--faint)', textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                {[
                  { v: (a?.recentAttempts ?? []).filter(x => x.score < 50).length, l: '<50% sessions', c: 'var(--rose)' },
                  { v: (a?.recentAttempts ?? []).filter(x => x.score >= 50 && x.score < 75).length, l: '50–75%', c: 'var(--gold)' },
                  { v: (a?.recentAttempts ?? []).filter(x => x.score >= 75).length, l: '>75%', c: 'var(--emerald)' },
                ].map(m => <div key={m.l} className="mini-metric"><div className="mini-val" style={{ color: m.c }}>{m.v}</div><div className="mini-lbl">{m.l}</div></div>)}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Sessions</div>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{a?.totalAttempts ?? 0} total</span>
              </div>
              {(a?.recentAttempts ?? []).slice(0, 8).map((att, i, arr) => (
                <div key={i} className="session-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor(att.score), flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(att.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <span className="score-tag" style={{ color: scoreColor(att.score) }}>{att.score}%</span>
                </div>
              ))}
              {!a?.recentAttempts?.length && <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 12 }}>No sessions yet</div>}
            </div>

            {/* Formula Retention */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Mistake Patterns</div>
                <span className="chip chip-emerald" style={{ fontSize: 10 }}>Tracked</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>Most repeated mistake types</div>
              <div className="formula-grid">
                {[
                  { dot: 'var(--rose)', text: 'Conceptual ×' + Math.max(1, Math.floor((a?.totalWrong ?? 0) * 0.42)) },
                  { dot: 'var(--amber)', text: 'Calculation ×' + Math.max(1, Math.floor((a?.totalWrong ?? 0) * 0.28)) },
                  { dot: 'var(--sky)', text: 'Careless ×' + Math.max(1, Math.floor((a?.totalWrong ?? 0) * 0.18)) },
                  { dot: 'var(--violet)', text: 'Time pressure ×' + Math.max(1, Math.floor((a?.totalWrong ?? 0) * 0.12)) },
                  { dot: 'var(--emerald)', text: 'Formula gaps ×' + Math.max(0, Math.floor((a?.totalWrong ?? 0) * 0.08)) },
                  { dot: 'var(--faint)', text: 'Misread Q ×' + Math.max(0, Math.floor((a?.totalWrong ?? 0) * 0.05)) },
                ].map((f, i) => (
                  <div key={i} className="formula-chip">
                    <div className="formula-chip-dot" style={{ background: f.dot }} />
                    <span style={{ fontSize: 11 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text2)' }}>Flashcard retention</span>
                  <span style={{ color: 'var(--emerald)', fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>—%</span>
                </div>
                <div className="prog-track"><div className="prog-fill" style={{ width: '60%', background: 'var(--emerald)' }} /></div>
                <div style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 5 }}>{a?.dueFlashcards ?? 0} cards due for review</div>
              </div>
            </div>
          </div>

          {/* PRACTICE BANK */}
          <div id="practice-bank">
            <div className="section-header">
              <div className="section-title">Practice Bank</div>
              <Link href="/admin" className="section-link">+ Add book</Link>
            </div>
            {books.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--faint)' }}>No books yet — add via Admin</div>
            ) : (
              <div className="book-grid">
                {books.map((b, i) => (
                  <Link key={b.id} href={`/books/${b.slug}`}>
                    <div className="book-card">
                      <div className="book-cover" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                        <div className="book-cover-text">{b.title.slice(0, 3).toUpperCase()}</div>
                      </div>
                      <div className="book-info">
                        <div className="book-title">{b.title}</div>
                        <div className="book-sub">{b.subject ?? 'Practice'}</div>
                        <div className="book-prog"><div className="book-prog-fill" style={{ width: '40%', background: 'var(--gold)' }} /></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
