'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Target, TrendingUp, BookMarked, Clock } from 'lucide-react';

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

        if (error) { console.error('Stats error:', error.message); setLoading(false); return; }
        if (attempts && attempts.length > 0) {
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

  const scoreColor = stats.totalAttempts === 0 ? '#6b7280' : stats.averageScore >= 75 ? '#34d399' : stats.averageScore >= 50 ? '#f5c842' : '#f87171';
  const scoreBg   = stats.totalAttempts === 0 ? 'rgba(107,114,128,0.15)' : stats.averageScore >= 75 ? 'rgba(52,211,153,0.12)' : stats.averageScore >= 50 ? 'rgba(245,200,66,0.12)' : 'rgba(248,113,113,0.12)';

  const cards = [
    { icon: <Target size={20} color="#ff7d3b" />, iconBg: 'rgba(255,125,59,0.15)', label: 'Total attempts', val: loading ? '…' : String(stats.totalAttempts), color: '#ffffff' },
    { icon: <TrendingUp size={20} color="#7b6cf6" />, iconBg: 'rgba(123,108,246,0.15)', label: 'Avg accuracy', val: loading ? '…' : stats.totalAttempts === 0 ? '—' : `${stats.averageScore}%`, color: scoreColor, valBg: scoreBg, hasScore: true },
    { icon: <BookMarked size={20} color="#34d399" />, iconBg: 'rgba(52,211,153,0.15)', label: 'Sets practiced', val: loading ? '…' : String(stats.uniqueQuizzes), color: '#ffffff' },
    { icon: <Clock size={20} color="#f5c842" />, iconBg: 'rgba(245,200,66,0.15)', label: 'Last session', val: loading ? '…' : (stats.lastAttempt || '—'), color: '#ffffff', small: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: '#1a1c2e', borderRadius: 16, padding: '20px 24px', border: '1px solid #2d3255', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {c.icon}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280' }}>{c.label}</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: c.small ? 20 : 32, fontWeight: 900, color: c.color, lineHeight: 1 }}>{c.val}</div>
        </div>
      ))}
    </div>
  );
}
