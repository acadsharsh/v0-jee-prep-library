'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Stats { totalAttempts:number; averageScore:number; lastAttempt:string|null; topicsCovered:number; }

export function StatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalAttempts:0, averageScore:0, lastAttempt:null, topicsCovered:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: attempts } = await supabase.from('quiz_attempts').select('score_percentage, created_at').eq('user_id', user.id);
        const { data: chapters } = await supabase.from('chapters').select('id', { count:'exact', head:false });
        if (attempts?.length) {
          const avg = attempts.reduce((s,a) => s+a.score_percentage, 0)/attempts.length;
          setStats({ totalAttempts:attempts.length, averageScore:Math.round(avg), lastAttempt:new Date(attempts[0].created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}), topicsCovered:chapters?.length??0 });
        }
      } catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  }, [user]);

  const scoreColor = stats.averageScore>=75 ? 'var(--lime)' : stats.averageScore>=50 ? 'var(--yellow)' : '#ff4444';

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1.5px solid var(--dim)' }}>
      {[
        { label:'Quizzes taken', val:loading?'—':stats.totalAttempts, color:'var(--white)' },
        { label:'Avg score', val:loading?'—':`${stats.averageScore}%`, color:scoreColor },
        { label:'Chapters done', val:loading?'—':stats.topicsCovered, color:'var(--mint)' },
        { label:'Last attempt', val:loading?'—':(stats.lastAttempt||'None'), color:'var(--muted)', small:true },
      ].map((c,i) => (
        <div key={i} style={{ padding:'20px 18px', borderRight:i<3?'1.5px solid var(--dim)':'none' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--muted)', marginBottom:8 }}>{c.label}</div>
          <div style={{ fontFamily:'Space Mono, monospace', fontSize:c.small?18:32, fontWeight:700, color:c.color, lineHeight:1 }}>{c.val}</div>
        </div>
      ))}
    </div>
  );
}
