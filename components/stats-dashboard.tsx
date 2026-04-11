'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [stats, setStats] = useState<Stats>({
    totalAttempts: 0,
    averageScore: 0,
    lastAttempt: null,
    topicsCovered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user || !supabase) return;

      try {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('score_percentage, created_at')
          .eq('user_id', user.id);

        const { data: chapters } = await supabase
          .from('chapters')
          .select('id', { count: 'exact', head: 0 });

        if (attempts && attempts.length > 0) {
          const avgScore = attempts.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.length;
          const lastAttempt = new Date(attempts[0].created_at).toLocaleDateString();

          setStats({
            totalAttempts: attempts.length,
            averageScore: Math.round(avgScore),
            lastAttempt,
            topicsCovered: chapters?.length ?? 0,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return <div className="text-slate-500">Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Total Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {stats.totalAttempts}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {stats.averageScore}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Topics Covered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {stats.topicsCovered}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Last Attempt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-slate-600">
            {stats.lastAttempt || 'No attempts'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
