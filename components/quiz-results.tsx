'use client';
import { RotateCcw, Home } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions:number; correctAnswers:number; answers:Record<string,string>; score?:number };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = result.score ?? Math.round((result.correctAnswers/result.totalQuestions)*100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const msg = pct>=80?'Excellent!':pct>=60?'Good job! Keep going':pct>=40?'More practice needed':'Go over this chapter again';

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:24,background:'var(--bg)'}}>
      <div style={{background:'#fff',borderRadius:'var(--r)',border:'1.5px solid var(--bd)',padding:36,textAlign:'center',maxWidth:480,width:'100%',boxShadow:'var(--sh)'}}>
        <div style={{fontSize:44,marginBottom:12}}>🎯</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:68,fontWeight:800,lineHeight:1,marginBottom:5,color:pct>=75?'var(--gn)':pct>=50?'var(--yw)':'var(--rd)'}}>{pct}%</div>
        <p style={{color:'var(--mu)',fontSize:14,marginBottom:28}}>{msg}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
          {[{bg:'var(--gnl)',v:result.correctAnswers,l:'Correct',c:'#166534'},{bg:'var(--rdl)',v:wrong,l:'Wrong',c:'#991B1B'},{bg:'var(--bg)',v:result.totalQuestions,l:'Total',c:'var(--mu)'}].map((s,i)=>(
            <div key={i} style={{padding:14,borderRadius:'var(--rs)',background:s.bg}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,marginTop:2,fontWeight:600,color:s.c}}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={onRetry} style={{width:'100%',marginBottom:9,padding:12,background:'var(--dk)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:13,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:'pointer'}}>Try Again</button>
        <button onClick={onHome} style={{width:'100%',padding:12,background:'var(--pu)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:13,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:'pointer'}}>Back to Practice</button>
      </div>
    </div>
  );
}
