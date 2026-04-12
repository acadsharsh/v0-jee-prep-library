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
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-slate-400 text-lg">Loading your dashboard...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black mb-2 text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
              Your Learning Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Track your progress, analyze performance, and master physics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Attempts Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-2xl text-white shadow-lg">
                <p className="text-sm font-semibold text-white/90 mb-2">Total Attempts</p>
                <p className="text-5xl font-black">{attempts.length}</p>
                <p className="text-white/80 text-sm mt-2">Quizzes completed</p>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-cyan-500 p-6 rounded-2xl text-white shadow-lg">
                <p className="text-sm font-semibold text-white/90 mb-2">Average Score</p>
                <p className="text-5xl font-black">
                  {attempts.length > 0 
                    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
                    : 0}%
                </p>
                <p className="text-white/80 text-sm mt-2">Across all quizzes</p>
              </div>
            </div>

            {/* Best Score Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-purple-400 to-pink-500 p-6 rounded-2xl text-white shadow-lg">
                <p className="text-sm font-semibold text-white/90 mb-2">Best Score</p>
                <p className="text-5xl font-black">
                  {attempts.length > 0 
                    ? Math.max(...attempts.map(a => a.score))
                    : 0}%
                </p>
                <p className="text-white/80 text-sm mt-2">Your best performance</p>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="mb-12 group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-black mb-8 text-white">Performance Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '0.75rem'
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Bar dataKey="score" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Attempts */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-white">Recent Quiz Attempts</h2>
              {attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 group/item">
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg group-hover/item:text-blue-300 transition-colors">{attempt.title}</p>
                        <p className="text-slate-400 text-sm mt-1">{attempt.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3">
                          <div className={`text-4xl font-black ${
                            attempt.score >= 80 ? 'text-green-400' :
                            attempt.score >= 60 ? 'text-yellow-400' :
                            'text-orange-400'
                          }`}>
                            {attempt.score}%
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold">{Math.round(attempt.score / 20)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg mb-6">No quiz attempts yet. Start learning!</p>
                  <Button 
                    onClick={() => router.push('/')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 font-bold rounded-full"
                  >
                    Browse Quizzes
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/">
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3 rounded-full font-bold"
              >
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
