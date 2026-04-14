'use client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

interface Mistake {
  id: string; question_id: string; question_text: string; correct_answer: string;
  explanation: string; times_wrong: number; last_wrong_at: string; resolved: boolean;
  notes: string | null; question_type: string;
  chapters?: { title: string; chapter_number: number; books?: { title: string; slug: string; } };
}

export default function MistakesPage() {
  const { session } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<{ [id: string]: string }>({});

  const fetchMistakes = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const url = filter === 'unresolved' ? '/api/mistakes?resolved=false' : '/api/mistakes';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setMistakes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMistakes(); }, [session, filter]);

  const markResolved = async (id: string) => {
    if (!session?.access_token) return;
    await fetch('/api/mistakes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id, resolved: true, notes: editNotes[id] ?? null }),
    });
    fetchMistakes();
  };

  const saveNotes = async (id: string) => {
    if (!session?.access_token) return;
    const mistake = mistakes.find(m => m.id === id);
    await fetch('/api/mistakes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id, resolved: mistake?.resolved ?? false, notes: editNotes[id] }),
    });
  };

  // Group by chapter
  const byChapter: Record<string, { chapterTitle: string; bookTitle: string; mistakes: Mistake[] }> = {};
  mistakes.forEach(m => {
    const key = m.chapters?.title ?? 'Uncategorized';
    if (!byChapter[key]) byChapter[key] = { chapterTitle: key, bookTitle: m.chapters?.books?.title ?? '', mistakes: [] };
    byChapter[key].mistakes.push(m);
  });

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#ff4d4d' }} />
            <span className="neo-topbar-title">Mistake Notebook</span>
            <div style={{ background: '#ff4d4d', border: '2px solid #0a0a0a', padding: '2px 10px', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {mistakes.length} mistakes
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'unresolved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`neo-chip ${filter === f ? 'active' : ''}`} style={{ fontSize: 11 }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 36, height: 36, border: '4px solid #eee', borderTopColor: '#ff4d4d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : mistakes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>NO MISTAKES!</div>
              <div style={{ color: '#777', fontSize: 14 }}>Either you're perfect or you haven't practiced yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Topic-wise summary */}
              <div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// TOPIC-WISE BREAKDOWN</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {Object.entries(byChapter).map(([key, group]) => (
                    <div key={key} style={{ background: '#fff', border: '3px solid #0a0a0a', padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#999', marginBottom: 4 }}>{group.bookTitle.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{group.chapterTitle}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 22, fontWeight: 700, color: '#ff4d4d' }}>{group.mistakes.length}</div>
                        <div style={{ fontSize: 11, color: '#777' }}>mistakes</div>
                      </div>
                      <div style={{ height: 4, background: '#f0f0f0', marginTop: 8 }}>
                        <div style={{ height: '100%', background: '#ff4d4d', width: `${Math.min(100, (group.mistakes.reduce((s, m) => s + m.times_wrong, 0) / 10) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual mistakes */}
              <div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// ALL MISTAKES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', overflow: 'hidden', background: '#fff' }}>
                  {mistakes.map((m, i) => (
                    <div key={m.id}>
                      <div style={{ padding: '14px 18px', borderBottom: i < mistakes.length - 1 ? '2px solid #eee' : 'none', cursor: 'pointer', background: m.resolved ? '#f9f9f9' : '#fff' }}
                        onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                              <div style={{ background: '#ff4d4d', border: '2px solid #0a0a0a', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#fff' }}>✗ {m.times_wrong}×</div>
                              {m.chapters && <div style={{ background: '#f5d90a', border: '2px solid #0a0a0a', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700 }}>{m.chapters.books?.title} — {m.chapters.title}</div>}
                              <div style={{ border: '2px solid #ddd', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#777' }}>{m.question_type.toUpperCase()}</div>
                              {m.resolved && <div style={{ background: '#b8f72b', border: '2px solid #0a0a0a', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700 }}>RESOLVED</div>}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.5 }}>{m.question_text?.slice(0, 120)}{(m.question_text?.length ?? 0) > 120 ? '…' : ''}</div>
                          </div>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 18, color: '#ccc', flexShrink: 0 }}>{expanded === m.id ? '▲' : '▼'}</div>
                        </div>
                      </div>

                      {expanded === m.id && (
                        <div style={{ background: '#f9f9f9', borderTop: '2px solid #eee', padding: '16px 18px' }}>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Full question</div>
                            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{m.question_text}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div style={{ background: '#fff', border: '2px solid #b8f72b', padding: '10px 14px' }}>
                              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#666', marginBottom: 4 }}>CORRECT ANSWER</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a' }}>{m.correct_answer}</div>
                            </div>
                            {m.explanation && (
                              <div style={{ background: '#fffbe6', border: '2px solid #f5d90a', padding: '10px 14px' }}>
                                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#666', marginBottom: 4 }}>EXPLANATION</div>
                                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{m.explanation}</div>
                              </div>
                            )}
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#999', marginBottom: 4 }}>YOUR NOTES</div>
                            <textarea value={editNotes[m.id] ?? m.notes ?? ''} onChange={e => setEditNotes(p => ({ ...p, [m.id]: e.target.value }))}
                              placeholder="Add your notes here..."
                              style={{ width: '100%', padding: '10px', border: '2px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, resize: 'vertical', outline: 'none', minHeight: 70 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => saveNotes(m.id)} className="neu-btn neu-btn-black" style={{ fontSize: 12, padding: '8px 16px' }}>Save Notes</button>
                            {!m.resolved && <button onClick={() => markResolved(m.id)} className="neu-btn" style={{ fontSize: 12, padding: '8px 16px', background: '#b8f72b' }}>✓ Mark Resolved</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
