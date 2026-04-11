'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Stats {
  totalAttempts: number;
  averageScore: number;
  lastAttempt: string | null;
  topicsCovered: number;
}

export function StatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, averageScore: 0, lastAttempt: null, topicsCovered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: attempts } = await supabase
          .from('quiz_attempts').select('score_percentage, created_at').eq('user_id', user.id);
        const { data: chapters } = await supabase
          .from('chapters').select('id', { count: 'exact', head: false });
        if (attempts?.length) {
          const avg = attempts.reduce((s, a) => s + a.score_percentage, 0) / attempts.length;
          setStats({
            totalAttempts: attempts.length,
            averageScore: Math.round(avg),
            lastAttempt: new Date(attempts[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            topicsCovered: chapters?.length ?? 0,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const scoreColor = stats.averageScore >= 75 ? 'var(--green)' : stats.averageScore >= 50 ? 'var(--acc)' : 'var(--red)';

  const cells = [
    { label: 'Quizzes taken', value: loading ? '—' : stats.totalAttempts, color: 'var(--tx-1)' },
    { label: 'Avg accuracy', value: loading ? '—' : `${stats.averageScore}%`, color: scoreColor },
    { label: 'Chapters done', value: loading ? '—' : stats.topicsCovered, color: 'var(--tx-1)' },
    { label: 'Last attempt', value: loading ? '—' : (stats.lastAttempt || 'None'), color: 'var(--tx-2)', small: true },
  ];

  return (
    <div className="stat-strip" style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {cells.map((c, i) => (
        <div key={i} className="stat-cell">
          <div className="stat-label">{c.label}</div>
          <div className="stat-val" style={{ color: c.color, fontSize: c.small ? 16 : 22 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
