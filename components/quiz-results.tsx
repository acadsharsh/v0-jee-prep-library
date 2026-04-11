'use client';

import { RotateCcw, Home } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions: number; correctAnswers: number; answers: Record<string, string> };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const scoreColor = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--acc)' : 'var(--red)';
  const msg = pct >= 80 ? 'Strong result.' : pct >= 60 ? 'Decent — review the wrong ones.' : pct >= 40 ? 'More practice needed.' : 'Go over this chapter again.';

  return (
    <div style={{
      minHeight: 'calc(100vh - 48px)',
      background: 'var(--bg-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div className="fade-in" style={{
        width: '100%', maxWidth: 460,
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {/* Score header */}
        <div style={{
          padding: '32px 28px',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--tx-3)', marginBottom: 12 }}>
            Quiz complete
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: 6 }}>
            {pct}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--tx-2)' }}>{msg}</div>
        </div>

        {/* Stats */}
        <div className="stat-strip">
          {[
            { label: 'Correct', val: result.correctAnswers, color: 'var(--green)' },
            { label: 'Wrong', val: wrong, color: 'var(--red)' },
            { label: 'Total', val: result.totalQuestions, color: 'var(--tx-1)' },
          ].map(s => (
            <div key={s.label} className="stat-cell" style={{ textAlign: 'center', alignItems: 'center' }}>
              <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 8 }}>
          <button onClick={onRetry} className="btn-acc" style={{ flex: 1, justifyContent: 'center' }}>
            <RotateCcw size={13} /> Try again
          </button>
          <button onClick={onHome} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
            <Home size={13} /> Library
          </button>
        </div>
      </div>
    </div>
  );
}
