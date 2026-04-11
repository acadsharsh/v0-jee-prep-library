'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface AttemptData {
  title: string;
  score: number;
  date: string;
  quiz_id: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '10px 14px',
      }}>
        <div style={{ fontSize: 12, color: '#8b92a5', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#4f8ef7', fontFamily: 'Syne, sans-serif' }}>
          {payload[0].value}%
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    const load = async () => {
      try {
        const { data } = await supabase
          .from('quiz_attempts')
          .select('id, quiz_id, score_percentage, created_at, quizzes(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) {
          const fmt: AttemptData[] = data.map(a => ({
            title: (a.quizzes as any)?.title || 'Quiz',
            score: a.score_percentage,
            date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            quiz_id: a.quiz_id,
          }));
          setAttempts(fmt);
          const seen = new Map();
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id, { name: a.title.split(' ').slice(0,2).join(' '), score: a.score }); });
          setChartData(Array.from(seen.values()).slice(0, 6));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user, loading, router]);

  const getScoreColor = (s: number) => s >= 75 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';

  if (loading || isLoading) {
    return (
      <>
        <Navigation />
        <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.08)',
              borderTopColor: '#4f8ef7',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#8b92a5', fontSize: 14 }}>Loading your dashboard…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <div className="animate-fade-up" style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#4f8ef7', marginBottom: 8, textTransform: 'uppercase' }}>
              Dashboard
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 36, letterSpacing: '-0.5px',
              color: '#f0f2f7',
            }}>
              Your progress
            </h1>
          </div>

          {/* Stats */}
          <div className="animate-fade-up" style={{ marginBottom: 28, animationDelay: '0.05s' }}>
            <StatsDashboard />
          </div>

          {/* Chart + Recent */}
          <div style={{ display: 'grid', gridTemplateColumns: chartData.length > 0 ? '1.4fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="animate-fade-up" style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: 24,
                animationDelay: '0.1s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <TrendingUp size={16} color="#4f8ef7" />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f2f7' }}>
                    Score by quiz
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fill: '#8b92a5', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.05)" tick={{ fill: '#8b92a5', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={getScoreColor(e.score)} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent attempts */}
            <div className="animate-fade-up" style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 24,
              animationDelay: '0.15s',
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f2f7', marginBottom: 20 }}>
                Recent attempts
              </div>

              {attempts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attempts.slice(0, 6).map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'all 0.15s',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f7', fontFamily: 'Syne, sans-serif' }}>
                          {a.title.length > 24 ? a.title.slice(0, 24) + '…' : a.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>{a.date}</div>
                      </div>
                      <div style={{
                        fontSize: 16, fontWeight: 800,
                        fontFamily: 'Syne, sans-serif',
                        color: getScoreColor(a.score),
                      }}>
                        {a.score}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: '#8b92a5', fontSize: 14, marginBottom: 16 }}>No attempts yet</p>
                  <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 8,
                    background: '#4f8ef7', color: '#fff',
                    fontSize: 13, fontWeight: 700,
                    textDecoration: 'none', fontFamily: 'Syne, sans-serif',
                  }}>
                    Start a quiz <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8b92a5',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none', fontFamily: 'Syne, sans-serif',
            }}>
              ← Back to library
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
