'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Book { id: string; slug: string; title: string; }
interface AttemptData { title: string; score: number; date: string; quiz_id: string; }

const BCOLORS: Record<string,string> = { hcv:'#f5d90a', irodov:'#ff7a00', ncert:'#0fd68a', dc:'#3d9eff', sl:'#ff6fd8', vk:'#ff4d4d', ms:'#b06ef3', cengage:'#b8f72b' };
function bColor(slug: string) { for (const k of Object.keys(BCOLORS)) { if (slug.toLowerCase().includes(k)) return BCOLORS[k]; } return '#f5d90a'; }
function bShort(title: string) { const map: Record<string,string> = {hcv:'HCV',irodov:'IRD',ncert:'NCRT',dc:'DCP',sl:'SL',vk:'VKJ',ms:'MSC',cengage:'CNG'}; for(const k of Object.keys(map)){if(title.toLowerCase().includes(k))return map[k];}return title.slice(0,3).toUpperCase(); }
const bgScore = (s:number) => s>=75?'#b8f72b':s>=50?'#f5d90a':'#ff4d4d';
const tcScore = (s:number) => s>=50?'#0a0a0a':'#fff';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [stats, setStats] = useState({ total:0, avg:0, unique:0, streak:1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    if(loading)return;
    if(!user){router.push('/login');return;}
    (async()=>{
      try{
        const[booksRes,{data}]=await Promise.all([
          fetch('/api/books'),
          supabase.from('quiz_attempts').select('quiz_id,score,completed_at,quizzes(title)').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(10),
        ]);
        const bd=await booksRes.json();
        setBooks(Array.isArray(bd)?bd:[]);
        if(data?.length){
          const fmt:AttemptData[]=data.map(a=>({title:(a.quizzes as any)?.title||'Practice',score:a.score??0,date:new Date(a.completed_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),quiz_id:a.quiz_id}));
          setAttempts(fmt);
          const avg=Math.round(fmt.reduce((s,a)=>s+a.score,0)/fmt.length);
          setStats({total:fmt.length,avg,unique:new Set(fmt.map(a=>a.quiz_id)).size,streak:1});
        }
      }catch(e){console.error(e);}
      finally{setIsLoading(false);}
    })();
  },[user,loading,router]);

  const name = user?.email?.split('@')[0]??'Student';
  const ini = user?.email?.slice(0,2).toUpperCase()??'JE';

  if(loading||isLoading) return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,border:'4px solid #333',borderTopColor:'#f5d90a',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px'}}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{fontSize:13,fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:'0.05em'}}>Loading…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">

        {/* Topbar */}
        <div className="neo-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:3,height:22,background:'#f5d90a'}}/>
            <span className="neo-topbar-title">Dashboard</span>
          </div>
          <div className="neo-topbar-right">
            <div style={{padding:'6px 14px',border:'2px solid #0a0a0a',background:'#0a0a0a',color:'#f5d90a',fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700}}>
              {name.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{padding:'24px'}}>

          {/* Greeting banner */}
          <div style={{background:'#f5d90a',border:'3px solid #0a0a0a',boxShadow:'6px 6px 0 #0a0a0a',padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#555',marginBottom:4}}>// WELCOME BACK</div>
              <div style={{fontSize:22,fontWeight:700,color:'#0a0a0a',letterSpacing:'-0.5px'}}>Good day, {name}! 📐</div>
            </div>
            <div style={{fontFamily:'Space Mono,monospace',fontSize:48,fontWeight:700,color:'rgba(0,0,0,0.1)',lineHeight:1}}>JEE</div>
          </div>

          {/* Stat tiles */}
          <div className="neo-stats-grid" style={{marginBottom:24,border:'3px solid #0a0a0a',boxShadow:'6px 6px 0 #0a0a0a'}}>
            {[
              {val:books.length,lbl:'Books available',color:'yellow',ico:'📚'},
              {val:stats.total,lbl:'Total attempts',color:'coral',ico:'🎯'},
              {val:stats.total>0?`${stats.avg}%`:'—',lbl:'Avg accuracy',color:'lime',ico:'📊'},
              {val:stats.unique,lbl:'Unique sets',color:'sky',ico:'✅'},
            ].map((s,i)=>(
              <div key={i} className={`neo-stat-tile ${s.color}`}>
                <div className="neo-stat-ico">{s.ico}</div>
                <div className="neo-stat-lbl">{s.lbl}</div>
                <div className="neo-stat-val">{String(s.val)}</div>
              </div>
            ))}
          </div>

          {/* Books + Recent — two col */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>

            {/* Books */}
            <div>
              <div className="neo-sec-head">
                <div className="neo-sec-title">Your Books</div>
                <Link href="/" style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#666',letterSpacing:'0.06em'}}>Browse all →</Link>
              </div>
              {books.length===0?(
                <div style={{background:'#fafafa',border:'3px solid #0a0a0a',padding:28,textAlign:'center',fontWeight:700,color:'#666'}}>No books yet — add via Admin</div>
              ):(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {books.map(b=>(
                    <Link key={b.id} href={`/books/${b.slug}`}>
                      <div className="neo-book-tile">
                        <div className="neo-book-spine" style={{background:bColor(b.slug)}}>{bShort(b.title)}</div>
                        <div className="neo-book-name">{b.title}</div>
                        <div className="neo-book-sub">Chapter practice</div>
                        <div className="neo-book-tag">Practice →</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent attempts */}
            <div>
              <div className="neo-sec-head">
                <div className="neo-sec-title">Recent Sessions</div>
              </div>
              {attempts.length===0?(
                <div style={{background:'#fafafa',border:'3px solid #0a0a0a',padding:28,textAlign:'center',fontWeight:700,color:'#666'}}>No sessions yet — start practicing!</div>
              ):(
                <div style={{border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',overflow:'hidden',background:'#fff'}}>
                  {attempts.slice(0,6).map((a,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:i<5?'2px solid #eee':'none'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:8,height:8,background:bgScore(a.score)}}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:700}}>{a.title.length>24?a.title.slice(0,24)+'…':a.title}</div>
                          <div style={{fontSize:11,color:'#999',marginTop:1}}>{a.date}</div>
                        </div>
                      </div>
                      <div className="neo-score-badge" style={{background:bgScore(a.score),color:tcScore(a.score)}}>{a.score}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Week strip */}
          <div className="neo-sec-head">
            <div className="neo-sec-title">This Week</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:0,border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',overflow:'hidden'}}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{
              const todayIdx=(new Date().getDay()+6)%7;
              const done=i<todayIdx;const today=i===todayIdx;
              return(
                <div key={d} style={{textAlign:'center',padding:'14px 8px',borderRight:i<6?'2px solid #eee':'none',background:today?'#f5d90a':done?'#0a0a0a':'#fafafa'}}>
                  <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:today?'#0a0a0a':done?'#f5d90a':'#999',marginBottom:8}}>{d}</div>
                  <div style={{fontFamily:'Space Mono,monospace',fontSize:14,fontWeight:700,color:today?'#0a0a0a':done?'#fff':'#ccc'}}>
                    {done?'✓':today?'●':'○'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
