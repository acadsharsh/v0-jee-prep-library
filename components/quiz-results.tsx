'use client';

interface QuizResultsProps {
  result: { totalQuestions: number; score: number; questionResults?: Array<{ correct: boolean; questionText: string; }>; timeTaken?: number };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = result.score;
  const correct = result.questionResults?.filter(q => q.correct).length ?? 0;
  const wrong = (result.totalQuestions) - correct;
  const color = pct >= 75 ? '#b8f72b' : pct >= 50 ? '#f5d90a' : '#ff4d4d';
  const msg = pct >= 80 ? 'EXCELLENT! 🔥' : pct >= 60 ? 'SOLID WORK 💪' : pct >= 40 ? 'KEEP GOING 📚' : 'TRY AGAIN 🎯';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 500, background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '8px 8px 0 #0a0a0a', overflow: 'hidden' }}>
        {/* Score */}
        <div style={{ background: color, borderBottom: '3px solid #0a0a0a', padding: '36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono,monospace', fontSize: 120, fontWeight: 700, color: 'rgba(0,0,0,0.08)', lineHeight: 1, pointerEvents: 'none' }}>{pct}</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,0,0,0.5)', marginBottom: 8 }}>// RESULT</div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 72, fontWeight: 700, color: '#0a0a0a', lineHeight: 1, marginBottom: 8 }}>{pct}<span style={{ fontSize: 36 }}>%</span></div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 14, fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{msg}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '3px solid #0a0a0a' }}>
          {[{ bg: '#b8f72b', v: correct, l: 'CORRECT' }, { bg: '#ff4d4d', tc: '#fff', v: wrong, l: 'WRONG' }, { bg: '#fafafa', v: result.totalQuestions, l: 'TOTAL' }].map((s, i) => (
            <div key={i} style={{ padding: '20px', textAlign: 'center', background: s.bg, borderRight: i < 2 ? '3px solid #0a0a0a' : 'none' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 36, fontWeight: 700, color: s.tc ?? '#0a0a0a' }}>{s.v}</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.tc ? 'rgba(255,255,255,0.7)' : '#666', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Saved notice */}
        <div style={{ padding: '12px 18px', background: '#f5f5f5', borderBottom: '2px solid #eee', fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#777', display: 'flex', alignItems: 'center', gap: 8 }}>
          ✓ Saved to mistake notebook · Flashcards auto-created for wrong answers
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex' }}>
          <button onClick={onRetry} style={{ flex: 1, padding: 16, background: '#0a0a0a', color: '#f5d90a', border: 'none', borderRight: '3px solid #0a0a0a', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>↻ Retry</button>
          <button onClick={onHome} style={{ flex: 1, padding: 16, background: '#fafafa', color: '#0a0a0a', border: 'none', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>← Back</button>
        </div>
      </div>
    </div>
  );
}
