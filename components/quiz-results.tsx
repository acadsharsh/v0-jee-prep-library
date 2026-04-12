'use client';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions: number; correctAnswers: number; answers: Record<string, string>; score?: number };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = result.score ?? Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const cfg = pct >= 75
    ? { bg: '#D1FAE5', cardBg: '#A7F3D0', color: '#065F46', emoji: '🏆', label: 'Excellent!', icon: '#10B981' }
    : pct >= 50
    ? { bg: '#FEF9C3', cardBg: '#FDE68A', color: '#92400E', emoji: '💪', label: 'Good effort!', icon: '#F59E0B' }
    : { bg: '#FEE2E2', cardBg: '#FCA5A5', color: '#991B1B', emoji: '📚', label: 'Keep grinding!', icon: '#EF4444' };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F2F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 500, background: '#FFFFFF', borderRadius: 28, overflow: 'hidden', border: '1.5px solid #E8EAF0', boxShadow: '0 24px 80px rgba(0,0,0,0.09)' }}>

        {/* Score header */}
        <div style={{ padding: '48px 36px 36px', background: cfg.bg, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{cfg.emoji}</div>
          <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 80, color: cfg.color, lineHeight: 1 }}>{pct}<span style={{ fontSize: 40 }}>%</span></div>
          <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 22, color: cfg.color, marginTop: 6 }}>{cfg.label}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1.5px solid #F0F0F8' }}>
          {[
            { label: 'Correct', val: result.correctAnswers, bg: '#D1FAE5', color: '#065F46' },
            { label: 'Wrong', val: wrong, bg: '#FEE2E2', color: '#991B1B' },
            { label: 'Total', val: result.totalQuestions, bg: '#EDE9FE', color: '#4C1D95' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '22px', textAlign: 'center', background: s.bg, borderRight: i < 2 ? '1.5px solid rgba(255,255,255,0.5)' : 'none' }}>
              <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 40, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: s.color, opacity: 0.65, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ padding: '20px 24px', display: 'flex', gap: 10 }}>
          <button onClick={onRetry} className="btn-dash-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <RotateCcw size={14} /> Try again
          </button>
          <button onClick={onHome} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
            <Home size={14} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
