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

interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 900, color: '#7b6cf6' }}>{payload[0].value}%</div>
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
          .select('id, quiz_id, score, completed_at, quizzes(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10);
        if (data) {
          const fmt: AttemptData[] = data.map(a => ({
            title: (a.quizzes as any)?.title || 'Quiz',
            score: a.score ?? 0,
            date: new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            quiz_id: a.quiz_id,
          }));
          setAttempts(fmt);
          const seen = new Map();
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id, { name: a.title.split(' ').slice(0, 2).join(' '), score: a.score }); });
          setChartData(Array.from(seen.values()).slice(0, 6));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  const hexScore = (s: number) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const cssScore = (s: number) => s >= 75 ? '#059669' : s >= 50 ? '#ca8a04' : '#ef4444';
  const bgScore = (s: number) => s >= 75 ? '#d1fae5' : s >= 50 ? '#fef9c3' : '#fee2e2';

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#f4f5fb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e8e8f0', borderTopColor: '#7b6cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>Loading…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background: '#f4f5fb', minHeight: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e8f0', padding: '20px 28px' }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Overview</div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 26, color: '#1e1e2d', letterSpacing: '-0.5px' }}>
            Hello, {user?.email?.split('@')[0] ?? 'Student'} 👋
          </h1>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>
          {/* Stats */}
          <StatsDashboard />

          {/* Chart + Recent */}
          <div style={{ display: 'grid', gridTemplateColumns: chartData.length ? '1.5fr 1fr' : '1fr', gap: 16 }}>
            {chartData.length > 0 && (
              <div className="d-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={16} color="#7b6cf6" />
                  </div>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: '#1e1e2d' }}>Score by quiz</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} cursor={{ fill: 'rgba(123,108,246,0.05)', radius: 8 }} />
                    <Bar dataKey="score" radius={[8, 8, 4, 4]}>
                      {chartData.map((e, i) => <Cell key={i} fill={hexScore(e.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="d-card">
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: '#1e1e2d', marginBottom: 16 }}>Recent attempts</div>
              {attempts.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attempts.slice(0, 6).map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: '#f4f5fb' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1e2d' }}>{a.title.length > 24 ? a.title.slice(0, 24) + '…' : a.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>{a.date}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: bgScore(a.score), color: cssScore(a.score), fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ color: '#9ca3af', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>No attempts yet</p>
                  <Link href="/" className="btn-primary" style={{ fontSize: 13 }}>Start a quiz <ArrowRight size={13} /></Link>
                </div>
              )}
            </div>
          </div>

          <Link href="/" className="btn-ghost-d" style={{ width: 'fit-content', fontSize: 13 }}>← Back to library</Link>
        </div>
      </main>
    </>
  );
}
