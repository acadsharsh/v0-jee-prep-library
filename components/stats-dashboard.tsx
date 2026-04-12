'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Target, TrendingUp, BookMarked, Clock } from 'lucide-react';

interface Stats { totalAttempts:number; averageScore:number; lastAttempt:string|null; uniqueQuizzes:number; }

export function StatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalAttempts:0, averageScore:0, lastAttempt:null, uniqueQuizzes:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase.from('quiz_attempts').select('score, completed_at, quiz_id').eq('user_id', user.id).order('completed_at', { ascending:false });
        if (data && data.length > 0) {
          const avg = data.reduce((s,a) => s+(a.score??0), 0) / data.length;
          setStats({ totalAttempts:data.length, averageScore:Math.round(avg), lastAttempt:new Date(data[0].completed_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}), uniqueQuizzes:new Set(data.map(a=>a.quiz_id)).size });
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const sc = (s:number) => s>=75 ? '#4CAF7D' : s>=50 ? '#FFD23F' : '#FF5252';

  const cards = [
    { icon:<Target size={20} color="#FF7D3B"/>, iconBg:'rgba(255,125,59,0.15)', label:'Total attempts', val:loading?'…':String(stats.totalAttempts), accent:'#FF7D3B' },
    { icon:<TrendingUp size={20} color="#9B7FE8"/>, iconBg:'rgba(155,127,232,0.15)', label:'Avg accuracy', val:loading?'…':stats.totalAttempts===0?'—':`${stats.averageScore}%`, accent: stats.totalAttempts>0 ? sc(stats.averageScore) : '#9B7FE8' },
    { icon:<BookMarked size={20} color="#4CAF7D"/>, iconBg:'rgba(76,175,125,0.15)', label:'Sets practiced', val:loading?'…':String(stats.uniqueQuizzes), accent:'#4CAF7D' },
    { icon:<Clock size={20} color="#FFD23F"/>, iconBg:'rgba(255,210,63,0.15)', label:'Last session', val:loading?'…':(stats.lastAttempt||'—'), accent:'#FFD23F', small:true },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
      {cards.map((c,i) => (
        <div key={i} style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:c.accent, opacity:0.6 }} />
          <div style={{ width:40, height:40, borderRadius:12, background:c.iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
            {c.icon}
          </div>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:6 }}>{c.label}</div>
          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:c.small?22:32, fontWeight:900, color:c.accent, lineHeight:1 }}>{c.val}</div>
        </div>
      ))}
    </div>
  );
}
