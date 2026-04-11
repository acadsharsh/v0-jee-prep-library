'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttemptData {
  title: string;
  score: number;
  date: string;
  quiz_id: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadAttempts = async () => {
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('id, quiz_id, score_percentage, created_at, quizzes(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          const formattedAttempts: AttemptData[] = data.map(attempt => ({
            title: (attempt.quizzes as any)?.title || 'Unknown Quiz',
            score: attempt.score_percentage,
            date: new Date(attempt.created_at).toLocaleDateString(),
            quiz_id: attempt.quiz_id,
          }));
          setAttempts(formattedAttempts);

          // Prepare chart data
          const chartDataMap = new Map();
          formattedAttempts.forEach(attempt => {
            if (!chartDataMap.has(attempt.quiz_id)) {
              chartDataMap.set(attempt.quiz_id, {
                name: attempt.title.split('-')[0].trim(),
                score: attempt.score,
              });
            }
          });
          setChartData(Array.from(chartDataMap.values()).slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load attempts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempts();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-slate-600">Loading dashboard...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 text-slate-900">Your Dashboard</h1>
            <p className="text-slate-600">Track your progress and performance</p>
          </div>

          {/* Stats */}
          <div className="mb-12">
            <StatsDashboard />
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <Card className="p-6 mb-12 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Performance Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Recent Attempts */}
          <Card className="p-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Recent Attempts</h2>
            {attempts.length > 0 ? (
              <div className="space-y-3">
                {attempts.map((attempt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{attempt.title}</p>
                      <p className="text-sm text-slate-600">{attempt.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{attempt.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No attempts yet. Start with a quiz!</p>
                <Button onClick={() => router.push('/')}>Browse Quizzes</Button>
              </div>
            )}
          </Card>

          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">Back to Library</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
