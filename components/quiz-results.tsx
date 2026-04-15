'use client';
import { MathText } from './math-renderer';

interface QuizResultsProps {
  result: { totalQuestions: number; score: number; questionResults?: Array<{ correct: boolean; questionText: string; correctAnswer: any; explanation?: string; type: string }>; timeTaken?: number };
  onRetry: () => void; onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = result.score;
  const correct = result.questionResults?.filter(q => q.correct).length ?? Math.round((pct / 100) * result.totalQuestions);
  const wrong = result.totalQuestions - correct;
  const color = pct >= 75 ? 'var(--lime)' : pct >= 50 ? 'var(--yellow)' : 'var(--coral)';
  const msg = pct >= 80 ? 'Excellent! 🔥' : pct >= 60 ? 'Good work 💪' : pct >= 40 ? 'Keep going 📚' : 'Try again 🎯';
  const secs = result.timeTaken;
  const timeStr = secs ? `${Math.floor(secs / 60)}m ${secs % 60}s` : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24, background: 'var(--bg)' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 520, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        {/* Score */}
        <div style={{ padding: '40px 36px 32px', textAlign: 'center', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'JetBrains Mono, monospace', fontSize: 180, fontWeight: 800, color: 'rgba(255,255,255,0.02)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{pct}</div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--faint)', marginBottom: 12 }}>Result</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 80, fontWeight: 700, color, lineHeight: 1, marginBottom: 8 }}>{pct}<span style={{ fontSize: 36 }}>%</span></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{msg}</div>
          {timeStr && <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 6 }}>Completed in {timeStr}</div>}
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid var(--border)' }}>
          {[
            { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', v: correct, l: 'Correct', c: 'var(--lime)' },
            { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', v: wrong, l: 'Wrong', c: 'var(--coral)' },
            { bg: 'var(--surface2)', border: 'var(--border)', v: result.totalQuestions, l: 'Total', c: 'var(--muted)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px', textAlign: 'center', background: s.bg, borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: s.c, opacity: 0.7, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Review wrong answers */}
        {result.questionResults?.filter(q => !q.correct).slice(0, 3).map((q, i) => (
          <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--coral)', marginBottom: 4 }}>✗ Wrong answer #{i + 1}</div>
            <MathText style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{(q.questionText ?? '').slice(0, 100)}{(q.questionText?.length ?? 0) > 100 ? '…' : ''}</MathText>
          </div>
        ))}

        {/* Save notice */}
        <div style={{ padding: '10px 20px', background: 'rgba(74,222,128,0.05)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--lime)', fontFamily: 'JetBrains Mono, monospace' }}>✓ Saved · Mistakes updated · Flashcards created</div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 0 }}>
          <button onClick={onRetry} style={{ flex: 1, padding: '16px', background: 'transparent', color: 'var(--yellow)', border: 'none', borderRight: '1px solid var(--border)', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,200,66,0.06)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >↺ Retry</button>
          <button onClick={onHome} style={{ flex: 1, padding: '16px', background: 'transparent', color: 'var(--muted)', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >← Back</button>
        </div>
      </div>
    </div>
  );
}
