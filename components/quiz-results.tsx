'use client';
import { RotateCcw, Home, Trophy, Target, Zap } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions:number; correctAnswers:number; answers:Record<string,string> };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const cfg = pct>=75
    ? { color:'#4CAF7D', accent:'rgba(76,175,125,0.15)', border:'rgba(76,175,125,0.3)', label:'Excellent! 🏆', emoji:'🏆' }
    : pct>=50
    ? { color:'#FFD23F', accent:'rgba(255,210,63,0.12)', border:'rgba(255,210,63,0.3)', label:'Good effort! 💪', emoji:'🎯' }
    : { color:'#FF5252', accent:'rgba(255,82,82,0.12)', border:'rgba(255,82,82,0.3)', label:'Keep grinding! 📚', emoji:'💪' };

  return (
    <div style={{ minHeight:'calc(100vh - 58px)', background:'#0d0d0d', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:500, display:'flex', flexDirection:'column', gap:14 }}>

        {/* Score hero */}
        <div style={{ background:'#141414', border:`1px solid ${cfg.border}`, borderRadius:20, padding:'40px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:cfg.accent, filter:'blur(50px)', pointerEvents:'none' }} />
          <div style={{ fontSize:52, marginBottom:10, position:'relative', zIndex:1 }}>{cfg.emoji}</div>
          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:76, fontWeight:900, color:cfg.color, lineHeight:1, position:'relative', zIndex:1 }}>{pct}%</div>
          <div style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.5)', marginTop:6, marginBottom:20, position:'relative', zIndex:1 }}>{cfg.label}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, position:'relative', zIndex:1 }}>
            {[
              { label:'Correct', val:result.correctAnswers, color:'#4CAF7D', bg:'rgba(76,175,125,0.12)', border:'rgba(76,175,125,0.25)' },
              { label:'Wrong', val:wrong, color:'#FF5252', bg:'rgba(255,82,82,0.12)', border:'rgba(255,82,82,0.25)' },
              { label:'Total', val:result.totalQuestions, color:'#9B7FE8', bg:'rgba(155,127,232,0.12)', border:'rgba(155,127,232,0.25)' },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:'14px 10px', textAlign:'center' }}>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:32, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:s.color, opacity:0.7, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onRetry} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:'#FFD23F', color:'#0d0d0d', border:'none', fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:800, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#FFC107'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='#FFD23F'}>
            <RotateCcw size={15}/> Try again
          </button>
          <button onClick={onHome} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:'#141414', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.2)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'}>
            <Home size={15}/> Library
          </button>
        </div>

      </div>
    </div>
  );
}
