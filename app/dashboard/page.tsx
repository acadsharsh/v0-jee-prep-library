'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { StatsDashboard } from '@/components/stats-dashboard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface Book { id:string; slug:string; title:string; cover_image_url:string|null; }
interface AttemptData { title:string; score:number; date:string; quiz_id:string; }

const BOOK_THEMES = [
  { accent:'#FFD23F', bg:'rgba(255,210,63,0.08)', border:'rgba(255,210,63,0.15)', icon:'⚡' },
  { accent:'#9B7FE8', bg:'rgba(155,127,232,0.08)', border:'rgba(155,127,232,0.15)', icon:'🔬' },
  { accent:'#4CAF7D', bg:'rgba(76,175,125,0.08)', border:'rgba(76,175,125,0.15)', icon:'📗' },
  { accent:'#FF7D3B', bg:'rgba(255,125,59,0.08)', border:'rgba(255,125,59,0.15)', icon:'⚗️' },
  { accent:'#4A9EFF', bg:'rgba(74,158,255,0.08)', border:'rgba(74,158,255,0.15)', icon:'🧮' },
];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 14px' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:2, fontWeight:700 }}>{label}</div>
      <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:22, fontWeight:900, color:'#FFD23F' }}>{payload[0].value}%</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    (async () => {
      try {
        const [booksRes, attemptsRes] = await Promise.all([
          fetch('/api/books'),
          supabase.from('quiz_attempts').select('quiz_id, score, completed_at, quizzes(title)').eq('user_id', user.id).order('completed_at', { ascending:false }).limit(10),
        ]);
        setBooks(await booksRes.json());
        const { data } = attemptsRes;
        if (data) {
          const fmt: AttemptData[] = data.map(a => ({ title:(a.quizzes as any)?.title||'Practice set', score:a.score??0, date:new Date(a.completed_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}), quiz_id:a.quiz_id }));
          setAttempts(fmt);
          const seen = new Map();
          fmt.forEach(a => { if (!seen.has(a.quiz_id)) seen.set(a.quiz_id, { name:a.title.split(' ').slice(0,2).join(' '), score:a.score }); });
          setChartData(Array.from(seen.values()).slice(0,6));
        }
      } catch(e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  const hexScore = (s:number) => s>=75 ? '#4CAF7D' : s>=50 ? '#FFD23F' : '#FF5252';
  const cssScore = (s:number) => s>=75 ? '#4CAF7D' : s>=50 ? '#FFD23F' : '#FF5252';
  const bgScore  = (s:number) => s>=75 ? 'rgba(76,175,125,0.15)' : s>=50 ? 'rgba(255,210,63,0.15)' : 'rgba(255,82,82,0.15)';

  if (loading || isLoading) return (
    <>
      <Navigation />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 58px)', background:'#0d0d0d' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.08)', borderTopColor:'#FFD23F', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:600 }}>Loading…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background:'#0d0d0d', minHeight:'calc(100vh - 58px)' }}>

        {/* Header bar */}
        <div style={{ background:'#0d0d0d', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'18px 28px' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Overview</div>
          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:24, color:'#fff', letterSpacing:'-0.4px' }}>
            Hello, {user?.email?.split('@')[0] ?? 'Student'} 👋
          </h1>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* KPI cards */}
          <StatsDashboard />

          {/* Book tiles */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.09em', color:'rgba(255,255,255,0.3)', marginBottom:4 }}>Practice Bank</div>
                <h2 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:18, color:'#fff' }}>Chapter-wise Practice</h2>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12 }}>
              {books.map((book, idx) => {
                const th = BOOK_THEMES[idx % BOOK_THEMES.length];
                return (
                  <Link key={book.id} href={`/books/${book.slug}`}>
                    <div style={{ background:'#141414', border:`1px solid ${th.border}`, borderRadius:16, padding:'20px 16px', cursor:'pointer', transition:'all 0.15s', display:'flex', flexDirection:'column', gap:14, minHeight:140 }}
                      onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=th.bg; el.style.transform='translateY(-3px)'; }}
                      onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='#141414'; el.style.transform='translateY(0)'; }}
                    >
                      <div style={{ fontSize:38 }}>{th.icon}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:800, color:'#fff', fontFamily:'Space Grotesk,sans-serif', lineHeight:1.25, marginBottom:6 }}>{book.title}</div>
                        <div style={{ fontSize:11, color:th.accent, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>Practice <ArrowRight size={11}/></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Chart + Recent */}
          <div style={{ display:'grid', gridTemplateColumns:chartData.length?'1.6fr 1fr':'1fr', gap:16 }}>
            {chartData.length > 0 && (
              <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:'rgba(155,127,232,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <TrendingUp size={16} color="#9B7FE8" />
                  </div>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:800, fontSize:15, color:'#fff' }}>Score history</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" stroke="transparent" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} stroke="transparent" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TT />} cursor={{ fill:'rgba(255,210,63,0.05)', radius:8 }} />
                    <Bar dataKey="score" radius={[8,8,4,4]}>
                      {chartData.map((e,i) => <Cell key={i} fill={hexScore(e.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'24px' }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:800, fontSize:15, color:'#fff', marginBottom:16 }}>Recent sessions</div>
              {attempts.length ? (
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {attempts.slice(0,6).map((a,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 13px', borderRadius:10, background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{a.title.length>22?a.title.slice(0,22)+'…':a.title}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:600, marginTop:2 }}>{a.date}</div>
                      </div>
                      <span style={{ padding:'3px 10px', borderRadius:8, background:bgScore(a.score), color:cssScore(a.score), fontSize:13, fontWeight:900, fontFamily:'Space Grotesk,sans-serif' }}>{a.score}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>📖</div>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:700, marginBottom:8 }}>No sessions yet</p>
                  <p style={{ color:'rgba(255,255,255,0.2)', fontSize:11, fontWeight:600 }}>Pick a book above to start</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
