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
    if (!user) return;
    (async () => {
      try {
        const { data: attempts } = await supabase
          .from('quiz_attempts').select('score, completed_at, quiz_id')
          .eq('user_id', user.id).order('completed_at', { ascending: false });
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

  const scoreColor = stats.averageScore >= 75 ? '#059669' : stats.averageScore >= 50 ? '#ca8a04' : '#ef4444';
  const scoreBg = stats.averageScore >= 75 ? '#d1fae5' : stats.averageScore >= 50 ? '#fef9c3' : '#fee2e2';

  const cards = [
    { icon: <Target size={20} color="#ff7d3b" />, iconBg: '#fff3ee', label: 'Quizzes taken', val: loading ? '—' : String(stats.totalAttempts), color: '#1e1e2d' },
    { icon: <TrendingUp size={20} color="#7b6cf6" />, iconBg: '#ede9fe', label: 'Avg score', val: loading ? '—' : `${stats.averageScore}%`, color: scoreColor, valBg: scoreBg },
    { icon: <BookMarked size={20} color="#059669" />, iconBg: '#d1fae5', label: 'Unique quizzes', val: loading ? '—' : String(stats.uniqueQuizzes), color: '#1e1e2d' },
    { icon: <Clock size={20} color="#ca8a04" />, iconBg: '#fef9c3', label: 'Last attempt', val: loading ? '—' : (stats.lastAttempt || 'None'), color: '#1e1e2d', small: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={i} className="stat-card">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {c.icon}
          </div>
          <div className="lbl">{c.label}</div>
          <div className="num" style={{ fontSize: c.small ? 22 : 32, color: c.color }}>
            {c.val}
          </div>
        </div>
      ))}
    </div>
  );
}
