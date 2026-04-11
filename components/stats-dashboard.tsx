'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { TrendingUp, Target, BookMarked, Clock } from 'lucide-react';

interface Stats {
  totalAttempts: number;
  averageScore: number;
  lastAttempt: string | null;
  topicsCovered: number;
}

function ScoreRing({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px`,
          fill: color, fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
        {value}%
      </text>
    </svg>
  );
}

export function StatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, averageScore: 0, lastAttempt: null, topicsCovered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('score_percentage, created_at')
          .eq('user_id', user.id);
        const { data: chapters } = await supabase
          .from('chapters')
          .select('id', { count: 'exact', head: false });
        if (attempts && attempts.length > 0) {
          const avgScore = attempts.reduce((s, a) => s + a.score_percentage, 0) / attempts.length;
          setStats({
            totalAttempts: attempts.length,
            averageScore: Math.round(avgScore),
            lastAttempt: new Date(attempts[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            topicsCovered: chapters?.length ?? 0,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadStats();
  }, [user]);

  const cards = [
    {
      label: 'Quizzes taken',
      value: loading ? '—' : stats.totalAttempts,
      sub: 'total attempts',
      icon: <Target size={18} />,
      color: '#4f8ef7',
      bg: 'rgba(79,142,247,0.08)',
    },
    {
      label: 'Avg score',
      value: loading ? '—' : null,
      scoreVal: loading ? 0 : stats.averageScore,
      sub: stats.averageScore >= 75 ? 'Great pace!' : 'Keep pushing',
      icon: <TrendingUp size={18} />,
      color: stats.averageScore >= 75 ? '#22c55e' : '#f59e0b',
      bg: stats.averageScore >= 75 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
      isScore: true,
    },
    {
      label: 'Topics covered',
      value: loading ? '—' : stats.topicsCovered,
      sub: 'chapters done',
      icon: <BookMarked size={18} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'Last attempt',
      value: loading ? '—' : (stats.lastAttempt || 'None yet'),
      sub: 'most recent quiz',
      icon: <Clock size={18} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      small: true,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          flexDirection: c.isScore ? 'row' : 'column',
          alignItems: c.isScore ? 'center' : 'flex-start',
          gap: c.isScore ? 16 : 12,
          transition: 'border-color 0.2s',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: c.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: c.color, flexShrink: 0,
          }}>
            {c.icon}
          </div>
          {c.isScore ? (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#8b92a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 12, color: '#4a5168' }}>{c.sub}</div>
              </div>
              <ScoreRing value={c.scoreVal ?? 0} size={72} />
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: '#8b92a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {c.label}
              </div>
              <div style={{
                fontSize: c.small ? 22 : 32,
                fontWeight: 800,
                fontFamily: 'Syne, sans-serif',
                color: c.color,
                lineHeight: 1,
              }}>
                {c.value}
              </div>
              <div style={{ fontSize: 12, color: '#4a5168', marginTop: -4 }}>{c.sub}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
