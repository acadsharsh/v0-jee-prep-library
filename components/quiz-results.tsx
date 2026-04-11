'use client';

import { Trophy, RotateCcw, Home, TrendingUp, Target } from 'lucide-react';

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  answers: Record<string, string>;
}
interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const scoreColor = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const scoreGlow = pct >= 75 ? 'rgba(34,197,94,0.3)' : pct >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)';
  const msg = pct >= 80 ? '🔥 Absolutely killing it!' : pct >= 65 ? '💪 Solid effort — keep it up!' : pct >= 50 ? '📚 Getting there — review & retry!' : '😤 Grind harder, you got this!';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Syne, sans-serif',
    }}>
      <div className="animate-scale-in" style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '48px 40px',
        textAlign: 'center',
      }}>
        {/* Trophy */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Trophy size={28} color="#f59e0b" />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f0f2f7', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Quiz complete!
        </h2>
        <p style={{ fontSize: 14, color: '#8b92a5', marginBottom: 36 }}>{msg}</p>

        {/* Score ring */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 36 }}>
          <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
            <circle cx={70} cy={70} r={r} fill="none" stroke={scoreColor} strokeWidth={10}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 12px ${scoreGlow})`, transition: 'stroke-dasharray 1.2s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>score</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Correct', value: result.correctAnswers, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
            { label: 'Wrong', value: wrong, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Total', value: result.totalQuestions, color: '#4f8ef7', bg: 'rgba(79,142,247,0.08)' },
          ].map((s) => (
            <div key={s.label} style={{
              padding: '16px 10px', borderRadius: 12,
              background: s.bg, border: `1px solid ${s.color}22`,
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRetry} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '13px 20px', borderRadius: 10,
            background: '#4f8ef7', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
            boxShadow: '0 0 24px rgba(79,142,247,0.35)',
          }}>
            <RotateCcw size={14} /> Try again
          </button>
          <button onClick={onHome} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '13px 20px', borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8b92a5', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          }}>
            <Home size={14} /> Library
          </button>
        </div>
      </div>
    </div>
  );
}
