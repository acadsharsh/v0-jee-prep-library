'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Book { id: string; slug: string; title: string; }
interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const BCOLORS: Record<string,string> = {
  hcv:'#7C6FF7', irodov:'#FF6B35', ncert:'#22C55E', dc:'#3B82F6',
  sl:'#EC4899', vk:'#EF4444', ms:'#8B5CF6', cengage:'#F59E0B',
};
const BSHORT: Record<string,string> = {
  hcv:'HCV', irodov:'IRD', ncert:'NCRT', dc:'DCP',
  sl:'SL', vk:'VKJ', ms:'MSC', cengage:'CNG',
};
function bColor(slug: string) { for (const k of Object.keys(BCOLORS)) { if (slug.toLowerCase().includes(k)) return BCOLORS[k]; } return '#7C6FF7'; }
function bShort(title: string) { for (const k of Object.keys(BSHORT)) { if (title.toLowerCase().includes(k)) return BSHORT[k]; } return title.slice(0,3).toUpperCase(); }
const bgScore  = (s: number) => s >= 75 ? '#DCFCE7' : s >= 50 ? '#FEF3C7' : '#FEE2E2';
const txtScore = (s: number) => s >= 75 ? '#166534' : s >= 50 ? '#854D0E' : '#991B1B';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, pct: 0, streak: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    (async () => {
      try {
        const [booksRes, { data }] = await Promise.all([
          fetch('/api/books'),
          supabase.from('quiz_attempts')
            .select('quiz_id, score, completed_at, quizzes(title)')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(10),
        ]);
        const booksData = await booksRes.json();
        setBooks(Array.isArray(booksData) ? booksData : []);
        if (data?.length) {
          const fmt: AttemptData[] = data.map(a => ({
            title: (a.quizzes as any)?.title || 'Practice set',
            score: a.score ?? 0,
            date: new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            quiz_id: a.quiz_id,
          }));
          setAttempts(fmt);
          const avg = Math.round(fmt.reduce((s,a) => s + a.score, 0) / fmt.length);
          setStats({ total: fmt.length, correct: fmt.filter(a => a.score >= 60).length, pct: avg, streak: 1 });
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user, loading, router]);

  const name = user?.email?.split('@')[0] ?? 'there';
  const ini = user?.email?.slice(0,2).toUpperCase() ?? 'U';
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;

  if (loading || isLoading) return (
    <div className="dbshell">
      <Navigation />
      <div className="sbmain" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40,height:40,borderRadius:'50%',border:'4px solid var(--pul)',borderTopColor:'var(--pu)',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color:'var(--mu)',fontSize:14,fontWeight:500 }}>Loading…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dbshell">
      <Navigation />
      <div className="sbmain">
        {/* Top bar */}
        <div className="dbtop">
          <div className="tbtitle">Dashboard</div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="nbtn">🔔<span className="ndot" /></div>
            <div className="uchip">
              <div className="ucav">{ini}</div>
              <span className="ucname">{name}</span>
            </div>
          </div>
        </div>

        <div className="sub active">
          {/* Greeting */}
          <div style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:26,fontWeight:800,marginBottom:3 }}>Good day, {name}! 👋</h2>
            <p style={{ color:'var(--mu)',fontSize:14 }}>Here's your practice overview.</p>
          </div>

          {/* Stat tiles */}
          <div className="sgrid">
            <div className="stile or"><div className="sico">📚</div><div className="sval">{books.length}</div><div className="slbl2">Books available</div></div>
            <div className="stile pu"><div className="sico">❓</div><div className="sval">{stats.total}</div><div className="slbl2">Total attempts</div></div>
            <div className="stile gn"><div className="sico">✅</div><div className="sval">{stats.total > 0 ? `${stats.pct}%` : '—'}</div><div className="slbl2">Avg accuracy</div></div>
            <div className="stile yw"><div className="sico">🔥</div><div className="sval">{stats.streak}</div><div className="slbl2">Day streak</div></div>
          </div>

          {/* Grid: calendar + quick start */}
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, marginBottom:24 }}>
            <div className="card">
              <div className="chead"><div className="ctitle">This Week</div></div>
              <div style={{ padding:'14px 18px' }}>
                <div style={{ display:'flex', gap:5 }}>
                  {days.map((d,i) => (
                    <div key={d} style={{ flex:1, textAlign:'center' }}>
                      <div style={{ fontSize:9,color:'var(--mu)',marginBottom:5,fontWeight:700,textTransform:'uppercase' }}>{d}</div>
                      <div style={{
                        width:26,height:26,borderRadius:'50%',margin:'0 auto',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:10,fontWeight:700,
                        background: i<todayIdx ? 'var(--or)' : i===todayIdx ? 'var(--pu)' : 'var(--bg)',
                        color: i<=todayIdx ? '#fff' : 'var(--mu)',
                      }}>
                        {i<todayIdx ? '✓' : i===todayIdx ? '●' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:16, marginTop:14, paddingTop:14, borderTop:'1px solid var(--bd)' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>{stats.total}</div>
                    <div style={{ fontSize:10,color:'var(--mu)' }}>Attempted</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>{stats.total > 0 ? `${stats.pct}%` : '—'}</div>
                    <div style={{ fontSize:10,color:'var(--mu)' }}>Accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="chead"><div className="ctitle">Quick Start</div></div>
              <div style={{ padding:16 }}>
                <p style={{ fontSize:12,color:'var(--mu)',marginBottom:14 }}>Jump into practice</p>
                {books.slice(0,3).map(b => (
                  <Link key={b.id} href={`/books/${b.slug}`}>
                    <div style={{
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'9px 12px',background:'var(--bg)',borderRadius:'var(--rs)',
                      cursor:'pointer',border:'1.5px solid var(--bd)',marginBottom:7,transition:'border .15s',
                    }}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='var(--pu)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor='var(--bd)'}
                    >
                      <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                        <div style={{ width:30,height:30,borderRadius:7,background:bColor(b.slug),display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'#fff' }}>{bShort(b.title)}</div>
                        <span style={{ fontSize:12,fontWeight:600 }}>{b.title}</span>
                      </div>
                      <span style={{ fontSize:11,color:'var(--mu)' }}>→</span>
                    </div>
                  </Link>
                ))}
                <Link href="/" style={{ display:'block',width:'100%',marginTop:12,padding:'10px',background:'var(--or)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:12,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:'pointer',textAlign:'center' }}>
                  Browse All →
                </Link>
              </div>
            </div>
          </div>

          {/* Books section */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h2 style={{ fontFamily:'Syne,sans-serif',fontSize:19,fontWeight:800 }}>Your Books</h2>
              <Link href="/" style={{ fontSize:11,color:'var(--pu)',fontWeight:600,cursor:'pointer',background:'var(--pul)',padding:'3px 10px',borderRadius:100 }}>Browse all</Link>
            </div>
            {books.length === 0 ? (
              <div style={{ fontSize:13,color:'var(--mu)',padding:'16px 0' }}>No books yet — add questions via Admin.</div>
            ) : (
              <div className="bcards">
                {books.map((b, idx) => (
                  <Link key={b.id} href={`/books/${b.slug}`}>
                    <div className="btile">
                      <div className="bspine" style={{ background: bColor(b.slug) }}>{bShort(b.title)}</div>
                      <div className="bname">{b.title}</div>
                      <div className="bsublbl">Chapter-wise practice</div>
                      <div className="bcnt">Practice →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent attempts */}
          {attempts.length > 0 && (
            <div>
              <h2 style={{ fontFamily:'Syne,sans-serif',fontSize:19,fontWeight:800,marginBottom:14 }}>Recent Sessions</h2>
              <div className="card">
                {attempts.slice(0,5).map((a,i) => (
                  <div key={i} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'14px 18px',borderBottom:i<4?'1px solid rgba(0,0,0,0.05)':'none',
                  }}>
                    <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:bgScore(a.score),display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>
                        {a.score >= 75 ? '🏆' : a.score >= 50 ? '📈' : '📚'}
                      </div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:600,color:'var(--tx)' }}>{a.title.length>30?a.title.slice(0,30)+'…':a.title}</div>
                        <div style={{ fontSize:11,color:'var(--mu)',marginTop:2 }}>{a.date}</div>
                      </div>
                    </div>
                    <span style={{ padding:'4px 12px',borderRadius:100,background:bgScore(a.score),color:txtScore(a.score),fontSize:13,fontWeight:700,fontFamily:'Syne,sans-serif' }}>
                      {a.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
