'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttemptData { title:string; score:number; date:string; quiz_id:string; }

const TT = ({ active, payload, label }: any) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'var(--black-2)', border:'1.5px solid var(--dim)', padding:'8px 14px' }}>
      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontFamily:'Space Mono, monospace', fontSize:20, fontWeight:700, color:'var(--lime)' }}>{payload[0].value}%</div>
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
        const { data } = await supabase.from('quiz_attempts')
          .select('id,quiz_id,score_percentage,created_at,quizzes(title)')
          .eq('user_id', user.id).order('created_at',{ascending:false}).limit(10);
        if (data) {
          const fmt: AttemptData[] = data.map(a => ({
            title:(a.quizzes as any)?.title||'Quiz',
            score:a.score_percentage,
            date:new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),
            quiz_id:a.quiz_id,
          }));
          setAttempts(fmt);
          const seen = new Map();
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id,{ name:a.title.split(' ').slice(0,2).join(' '), score:a.score }); });
          setChartData(Array.from(seen.values()).slice(0,6));
        }
      } catch(e){console.error(e);}
      finally{setIsLoading(false);}
    })();
  }, [user,loading,router]);

  const hexScore = (s:number) => s>=75 ? '#c8ff57' : s>=50 ? '#ffe94a' : '#ff4444';
  const cssScore = (s:number) => s>=75 ? 'var(--lime)' : s>=50 ? 'var(--yellow)' : '#ff4444';

  if (loading||isLoading) return (
    <>
      <Navigation />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 52px)', fontFamily:'Space Mono, monospace', color:'var(--muted)', fontSize:13 }}>
        LOADING...
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background:'var(--black)', minHeight:'calc(100vh - 52px)' }}>

        {/* Page title */}
        <div style={{ padding:'24px 40px 20px', borderBottom:'1.5px solid var(--dim)' }}>
          <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px' }}>DASHBOARD</h1>
        </div>

        <div style={{ padding:'32px 40px', display:'flex', flexDirection:'column', gap:28, maxWidth:1000 }}>
          <StatsDashboard />

          <div style={{ display:'grid', gridTemplateColumns:chartData.length?'1.5fr 1fr':'1fr', gap:0, border:'1.5px solid var(--dim)' }}>
            {chartData.length > 0 && (
              <div style={{ borderRight:'1.5px solid var(--dim)', padding:'24px' }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', marginBottom:20 }}>
                  Score by quiz
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" stroke="transparent" tick={{ fill:'#555', fontSize:10, fontFamily:'Space Mono' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} stroke="transparent" tick={{ fill:'#555', fontSize:10, fontFamily:'Space Mono' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="score" radius={[0,0,0,0]}>
                      {chartData.map((e,i) => <Cell key={i} fill={hexScore(e.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ padding:'24px' }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', marginBottom:20 }}>
                Recent attempts
              </div>
              {attempts.length ? (
                <div>
                  {attempts.slice(0,6).map((a,i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'11px 0', borderBottom:i<5?'1px solid var(--dim)':'none',
                    }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--white)' }}>
                          {a.title.length>26 ? a.title.slice(0,26)+'…' : a.title}
                        </div>
                        <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{a.date}</div>
                      </div>
                      <span style={{ fontFamily:'Space Mono, monospace', fontSize:18, fontWeight:700, color:cssScore(a.score) }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <p style={{ color:'var(--muted)', fontSize:13, marginBottom:16 }}>No attempts yet</p>
                  <Link href="/" className="btn-lime" style={{ fontSize:12 }}>Start a quiz →</Link>
                </div>
              )}
            </div>
          </div>

          <Link href="/" className="btn-outline" style={{ width:'fit-content', fontSize:12 }}>← Back to library</Link>
        </div>
      </main>
    </>
  );
}
