'use client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

interface Flashcard {
  id: string; front_text: string; back_text: string; source: string;
  ease_factor: number; interval_days: number; repetitions: number;
  next_review_at: string; chapters?: { title: string };
}

export default function FlashcardsPage() {
  const { session } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'review'>('list');
  const [curIdx, setCurIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dueOnly, setDueOnly] = useState(true);

  const fetchCards = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const url = `/api/flashcards${dueOnly ? '?due=true' : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, [session, dueOnly]);

  const rateCard = async (quality: number) => {
    if (!session?.access_token || !cards[curIdx]) return;
    await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id: cards[curIdx].id, quality }),
    });
    setFlipped(false);
    if (curIdx < cards.length - 1) setCurIdx(p => p + 1);
    else { setMode('list'); setCurIdx(0); fetchCards(); }
  };

  const QUALITY_LABELS = [
    { q: 0, label: 'Blackout', bg: '#ff4d4d', tc: '#fff' },
    { q: 2, label: 'Hard', bg: '#ff7a00', tc: '#fff' },
    { q: 3, label: 'OK', bg: '#f5d90a', tc: '#0a0a0a' },
    { q: 5, label: 'Easy', bg: '#b8f72b', tc: '#0a0a0a' },
  ];

  const isDue = (card: Flashcard) => new Date(card.next_review_at) <= new Date();

  if (mode === 'review' && cards.length > 0) {
    const card = cards[curIdx];
    return (
      <div className="neo-shell">
        <Navigation />
        <div className="neo-main">
          <div className="neo-topbar">
            <button onClick={() => setMode('list')} style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#777', textTransform: 'uppercase' }}>← Stop Review</button>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, color: '#777' }}>{curIdx + 1} / {cards.length}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 640 }}>
              {/* Progress */}
              <div style={{ height: 6, background: '#eee', marginBottom: 24, border: '2px solid #0a0a0a' }}>
                <div style={{ height: '100%', background: '#f5d90a', width: `${((curIdx + 1) / cards.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>

              {/* Card */}
              <div onClick={() => setFlipped(p => !p)} style={{
                background: flipped ? '#f5d90a' : '#fafafa',
                border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
                padding: 40, minHeight: 260, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                transition: 'background 0.2s', marginBottom: 20,
              }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: flipped ? '#0a0a0a' : '#999', marginBottom: 16 }}>
                  {flipped ? '// ANSWER' : '// QUESTION — click to reveal'}
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.7, color: '#0a0a0a', fontWeight: flipped ? 600 : 500, whiteSpace: 'pre-wrap' }}>
                  {flipped ? card.back_text : card.front_text}
                </div>
                {card.chapters && (
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#777', marginTop: 16 }}>{card.chapters.title}</div>
                )}
              </div>

              {flipped && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {QUALITY_LABELS.map(ql => (
                    <button key={ql.q} onClick={() => rateCard(ql.q)} style={{ padding: '14px 8px', background: ql.bg, border: '3px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: ql.tc, cursor: 'pointer', transition: 'transform 0.1s', textTransform: 'uppercase' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)'}
                    >
                      {ql.label}
                    </button>
                  ))}
                </div>
              )}
              {!flipped && (
                <div style={{ textAlign: 'center', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#999', marginTop: 12 }}>
                  Click card to see answer, then rate how well you knew it
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dueCards = cards.filter(isDue);

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#3d9eff' }} />
            <span className="neo-topbar-title">Flashcards</span>
            <div style={{ background: dueCards.length > 0 ? '#ff4d4d' : '#b8f72b', border: '2px solid #0a0a0a', padding: '2px 10px', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: dueCards.length > 0 ? '#fff' : '#0a0a0a' }}>
              {dueCards.length} DUE
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDueOnly(!dueOnly)} className={`neo-chip ${dueOnly ? 'active' : ''}`} style={{ fontSize: 11 }}>DUE ONLY</button>
            {cards.length > 0 && <button onClick={() => { setCurIdx(0); setFlipped(false); setMode('review'); }} className="neu-btn" style={{ fontSize: 12, padding: '8px 16px' }}>▶ Start Review ({cards.length})</button>}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 36, height: 36, border: '4px solid #eee', borderTopColor: '#3d9eff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>NO FLASHCARDS YET</div>
              <div style={{ color: '#777', fontSize: 14 }}>Flashcards are auto-created from your mistakes. Start practicing to generate them!</div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// {cards.length} CARDS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {cards.map(card => (
                  <div key={card.id} style={{ background: isDue(card) ? '#fff3f3' : '#fff', border: `3px solid ${isDue(card) ? '#ff4d4d' : '#0a0a0a'}`, padding: '16px', boxShadow: '3px 3px 0 #0a0a0a' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      {isDue(card) && <span style={{ background: '#ff4d4d', border: '2px solid #0a0a0a', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 9, fontWeight: 700, color: '#fff' }}>DUE</span>}
                      <span style={{ border: '2px solid #ddd', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 9, fontWeight: 700, color: '#777' }}>×{card.repetitions}</span>
                      <span style={{ border: '2px solid #ddd', padding: '1px 8px', fontFamily: 'Space Mono,monospace', fontSize: 9, fontWeight: 700, color: '#777' }}>{card.interval_days}d</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.5, marginBottom: 6 }}>{card.front_text?.slice(0, 100)}{(card.front_text?.length ?? 0) > 100 ? '…' : ''}</div>
                    {card.chapters && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#999' }}>{card.chapters.title}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
