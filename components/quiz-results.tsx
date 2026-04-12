'use client';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions: number; correctAnswers: number; answers: Record<string, string> };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const cfg = pct >= 75 ? { color: '#059669', bg: '#d1fae5', label: 'Excellent! 🎉', ring: '#10b981' }
    : pct >= 50 ? { color: '#ca8a04', bg: '#fef9c3', label: 'Good effort! 💪', ring: '#f59e0b' }
    : { color: '#ef4444', bg: '#fee2e2', label: 'Keep grinding! 📚', ring: '#f87171' };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 480, background: '#ffffff', borderRadius: 24, overflow: 'hidden', border: '1px solid #e8e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

        {/* Score header */}
        <div style={{ padding: '48px 36px 36px', background: cfg.bg, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 24px ${cfg.ring}40` }}>
            <Trophy size={36} color={cfg.color} />
          </div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 72, fontWeight: 900, color: cfg.color, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color, marginTop: 8 }}>{cfg.label}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #e8e8f0' }}>
          {[
            { label: 'Correct', val: result.correctAnswers, color: '#059669', bg: '#d1fae5' },
            { label: 'Wrong', val: wrong, color: '#ef4444', bg: '#fee2e2' },
            { label: 'Total', val: result.totalQuestions, color: '#7b6cf6', bg: '#ede9fe' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e8e8f0' : 'none', background: s.bg }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: s.color, opacity: 0.7, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ padding: '20px 24px', display: 'flex', gap: 10 }}>
          <button onClick={onRetry} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <RotateCcw size={14} /> Try again
          </button>
          <button onClick={onHome} className="btn-ghost-d" style={{ flex: 1, justifyContent: 'center' }}>
            <Home size={14} /> Library
          </button>
        </div>
      </div>
    </div>
  );
}
