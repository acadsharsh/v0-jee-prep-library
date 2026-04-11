'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight } from 'lucide-react';

interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-mid)', borderRadius: 5, padding: '7px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--tx-3)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx-1)' }}>{payload[0].value}%</div>
    </div>
  );
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
    (async () => {
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
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id, { name: a.title.split(' ').slice(0, 3).join(' '), score: a.score }); });
          setChartData(Array.from(seen.values()).slice(0, 6));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  const scoreColor = (s: number) => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--acc)' : 'var(--red)';
  const scoreHex = (s: number) => s >= 75 ? '#4caf7d' : s >= 50 ? '#e8824a' : '#e05c5c';

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 48px)', color: 'var(--tx-3)', fontSize: 13 }}>
        Loading…
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--bg-0)', minHeight: 'calc(100vh - 48px)' }}>

        {/* Page header */}
        <div style={{ padding: '20px 32px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--tx-3)', marginBottom: 4 }}>Overview</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 16 }}>Dashboard</h1>
        </div>

        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>

          {/* Stats strip */}
          <div className="fade-in">
            <StatsDashboard />
          </div>

          {/* Chart + Recent — two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: chartData.length ? '1.5fr 1fr' : '1fr', gap: 16 }}>

            {chartData.length > 0 && (
              <div className="fade-in" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div className="pane-header">Score by quiz</div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barCategoryGap="35%">
                      <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#5c6273', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: '#5c6273', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {chartData.map((e, i) => <Cell key={i} fill={scoreHex(e.score)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent attempts */}
            <div className="fade-in" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              <div className="pane-header">Recent attempts</div>
              {attempts.length ? (
                <div>
                  {attempts.slice(0, 6).map((a, i) => (
                    <div key={i} className="row-item" style={{
                      borderBottom: i < Math.min(attempts.length, 6) - 1 ? '1px solid var(--border)' : 'none',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx-1)' }}>
                          {a.title.length > 28 ? a.title.slice(0, 28) + '…' : a.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 2 }}>{a.date}</div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(a.score) }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--tx-3)', fontSize: 13, marginBottom: 14 }}>No attempts yet</p>
                  <Link href="/" className="btn-acc" style={{ fontSize: 12 }}>
                    Start a quiz <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Link href="/" className="btn-ghost" style={{ width: 'fit-content', fontSize: 12 }}>
            ← Back to library
          </Link>
        </div>
      </main>
    </>
  );
}
