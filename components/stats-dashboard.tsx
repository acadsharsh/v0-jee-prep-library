'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Target, TrendingUp, Layers, Clock } from 'lucide-react';

interface Stats { totalAttempts: number; averageScore: number; lastAttempt: string | null; uniqueQuizzes: number; }

export function StatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, averageScore: 0, lastAttempt: null, uniqueQuizzes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const { data: attempts, error } = await supabase
          .from('quiz_attempts')
          .select('score, completed_at, quiz_id')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });
        if (error) { console.error('Stats error:', error.message); return; }
        if (attempts?.length) {
          const avg = attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length;
          setStats({
            totalAttempts: attempts.length,
            averageScore: Math.round(avg),
            lastAttempt: new Date(attempts[0].completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            uniqueQuizzes: new Set(attempts.map(a => a.quiz_id)).size,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const pct = `${stats.totalAttempts > 0 ? Math.min(100, Math.round((stats.uniqueQuizzes / Math.max(stats.totalAttempts, 1)) * 100)) : 0}%`;

  const cards = [
    {
      bg: '#C8DFFE', icon: <Target size={28} color="#1D4ED8" />, iconBg: 'rgba(29,78,216,0.1)',
      label: 'Completed', sub: 'total attempts',
      val: loading ? '…' : `${stats.totalAttempts}`,
      suffix: '',
    },
    {
      bg: '#DDD6FE', icon: <Layers size={28} color="#6D28D9" />, iconBg: 'rgba(109,40,217,0.1)',
      label: 'Sets practiced', sub: `${stats.uniqueQuizzes} unique`,
      val: loading ? '…' : `${stats.uniqueQuizzes}`,
      suffix: '',
    },
    {
      bg: '#FBD0E8', icon: <TrendingUp size={28} color="#BE185D" />, iconBg: 'rgba(190,24,93,0.1)',
      label: 'Avg score', sub: stats.totalAttempts === 0 ? 'no attempts yet' : stats.averageScore >= 75 ? 'great job!' : 'keep going!',
      val: loading ? '…' : stats.totalAttempts === 0 ? '—' : `${stats.averageScore}`,
      suffix: stats.totalAttempts > 0 ? '%' : '',
    },
    {
      bg: '#FDE68A', icon: <Clock size={28} color="#92400E" />, iconBg: 'rgba(146,64,14,0.1)',
      label: 'Last session', sub: 'most recent',
      val: loading ? '…' : (stats.lastAttempt || '—'),
      suffix: '', small: true,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 0 }}>
      {cards.map((c, i) => (
        <div key={i} className="stat-card" style={{ background: c.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="lbl">{c.label}</span>
            <div className="icon" style={{ position: 'static', opacity: 1, width: 36, height: 36, borderRadius: 10, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.icon}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span className="val" style={{ fontSize: c.small ? 24 : 38 }}>{c.val}</span>
            {c.suffix && <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 20, color: '#1A1A2E', opacity: 0.6 }}>{c.suffix}</span>}
          </div>
          <span className="sub">{c.sub}</span>
        </div>
      ))}
    </div>
  );
}
