'use client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { MathText } from '@/components/math-renderer';

interface Mistake {
  id: string; question_id: string; question_text: string; correct_answer: string;
  explanation: string; times_wrong: number; last_wrong_at: string; resolved: boolean;
  notes: string | null; question_type: string;
  chapters?: { title: string; chapter_number: number; books?: { title: string; slug: string; } };
  quizzes?: { title: string };
}

interface ChapterGroup { chapterId: string; chapterTitle: string; bookTitle: string; mistakes: Mistake[]; expanded: boolean; }

function scoreLabel(t: number) { return t >= 3 ? 'Critical' : t === 2 ? 'Repeat' : 'Once'; }
function scoreClass(t: number) { return t >= 3 ? 'badge-coral' : t === 2 ? 'badge-orange' : 'badge-muted'; }

export default function MistakesPage() {
  const { session } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [view, setView] = useState<'chapters' | 'list'>('chapters');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<{ [id: string]: string }>({});

  const fetch_ = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const url = filter === 'resolved' ? '/api/mistakes?resolved=true' : filter === 'unresolved' ? '/api/mistakes?resolved=false' : '/api/mistakes';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setMistakes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [session, filter]);

  const patch = async (id: string, resolved: boolean) => {
    if (!session?.access_token) return;
    await fetch('/api/mistakes', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id, resolved, notes: editNotes[id] ?? null }) });
    fetch_();
  };

  // Group by chapter
  const chapterGroups: ChapterGroup[] = [];
  const chapterMap: Record<string, ChapterGroup> = {};
  mistakes.forEach(m => {
    const key = m.chapters?.title ?? 'Uncategorized';
    if (!chapterMap[key]) {
      chapterMap[key] = { chapterId: key, chapterTitle: key, bookTitle: m.chapters?.books?.title ?? '', mistakes: [], expanded: false };
      chapterGroups.push(chapterMap[key]);
    }
    chapterMap[key].mistakes.push(m);
  });
  chapterGroups.sort((a, b) => b.mistakes.reduce((s,m)=>s+m.times_wrong,0) - a.mistakes.reduce((s,m)=>s+m.times_wrong,0));

  const totalWrong = mistakes.reduce((s, m) => s + m.times_wrong, 0);
  const critical = mistakes.filter(m => m.times_wrong >= 3).length;
  const resolved = mistakes.filter(m => m.resolved).length;

  const toggleChap = (key: string) => {
    setExpandedChapters(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  };

  const MistakeCard = ({ m }: { m: Mistake }) => (
    <div key={m.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpandedQ(expandedQ === m.id ? null : m.id)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${scoreClass(m.times_wrong)}`}>✗ {m.times_wrong}×  {scoreLabel(m.times_wrong)}</span>
            <span className="badge badge-muted">{m.question_type.toUpperCase()}</span>
            {m.resolved && <span className="badge badge-lime">✓ Resolved</span>}
          </div>
          <MathText style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.6 }}>
            {(m.question_text ?? '').slice(0, 140)}{(m.question_text?.length ?? 0) > 140 ? '…' : ''}
          </MathText>
        </div>
        <div style={{ fontSize: 14, color: 'var(--faint)', flexShrink: 0 }}>{expandedQ === m.id ? '▲' : '▼'}</div>
      </div>

      {expandedQ === m.id && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: 'var(--surface2)' }} className="fade-up">
          <div style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 14, color: 'var(--text)' }}>
            <MathText>{m.question_text ?? ''}</MathText>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--lime)', marginBottom: 6 }}>Correct Answer</div>
              <MathText style={{ fontSize: 14, fontWeight: 600 }}>{m.correct_answer ?? ''}</MathText>
            </div>
            {m.explanation && (
              <div style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: 6 }}>Explanation</div>
                <MathText style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--muted)' }}>{m.explanation ?? ''}</MathText>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="field-label">Your Notes</label>
            <textarea className="field-input" value={editNotes[m.id] ?? m.notes ?? ''} onChange={e => setEditNotes(p => ({ ...p, [m.id]: e.target.value }))} placeholder="Add your notes…" style={{ minHeight: 60 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => patch(m.id, m.resolved)} className="btn-ghost" style={{ fontSize: 12 }}>Save Notes</button>
            {!m.resolved ? (
              <button onClick={() => patch(m.id, true)} className="btn-primary" style={{ fontSize: 12, background: 'var(--lime)', color: '#0a0a0a' }}>✓ Mark Resolved</button>
            ) : (
              <button onClick={() => patch(m.id, false)} className="btn-ghost" style={{ fontSize: 12 }}>Reopen</button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Navigation />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Mistake Notebook</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{mistakes.length} mistakes tracked</div>
          </div>
          <div className="topbar-right">
            <button onClick={() => setView(view === 'chapters' ? 'list' : 'chapters')} className="btn-ghost" style={{ fontSize: 12 }}>
              {view === 'chapters' ? '≡ List' : '⊞ Chapters'}
            </button>
            {(['all', 'unresolved', 'resolved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? 'active' : ''}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { val: mistakes.length, lbl: 'Total mistakes', color: 'var(--coral)' },
              { val: critical, lbl: 'Critical (3+×)', color: 'var(--orange)' },
              { val: totalWrong, lbl: 'Total wrong attempts', color: 'var(--yellow)' },
              { val: chapterGroups.length, lbl: 'Chapters affected', color: 'var(--purple)' },
            ].map((s, i) => (
              <div key={i} className="glass-card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--surface3)', borderTopColor: 'var(--coral)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : mistakes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--faint)' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>No mistakes here!</div>
              <div style={{ fontSize: 14 }}>Either you're perfect or you haven't practiced yet.</div>
            </div>
          ) : view === 'chapters' ? (
            /* CHAPTER VIEW */
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 14 }}>Chapter-wise breakdown</div>
              {chapterGroups.map(group => {
                const isOpen = expandedChapters.has(group.chapterId);
                const topicWrong = group.mistakes.reduce((s, m) => s + m.times_wrong, 0);
                const pct = Math.round((group.mistakes.filter(m => m.resolved).length / group.mistakes.length) * 100);
                return (
                  <div key={group.chapterId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', marginBottom: 10, overflow: 'hidden' }}>
                    {/* Chapter header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
                      onClick={() => toggleChap(group.chapterId)}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📖</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{group.chapterTitle}</span>
                          <span style={{ fontSize: 11, color: 'var(--faint)' }}>{group.bookTitle}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-track" style={{ width: 100, height: 4 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 60 ? 'var(--lime)' : 'var(--yellow)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{pct}% resolved</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge badge-coral">{group.mistakes.length} mistakes</span>
                        <span className="badge badge-orange">✗ {topicWrong}×</span>
                        <span style={{ color: 'var(--faint)', fontSize: 14 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px' }} className="fade-up">
                        {group.mistakes.map(m => <MistakeCard key={m.id} m={m} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 14 }}>All mistakes — sorted by frequency</div>
              {mistakes.sort((a, b) => b.times_wrong - a.times_wrong).map(m => <MistakeCard key={m.id} m={m} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
