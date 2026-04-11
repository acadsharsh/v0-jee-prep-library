'use client';
import { RotateCcw, Home } from 'lucide-react';

interface QuizResultsProps {
  result: { totalQuestions:number; correctAnswers:number; answers:Record<string,string> };
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const pct = Math.round((result.correctAnswers/result.totalQuestions)*100);
  const wrong = result.totalQuestions - result.correctAnswers;
  const accent = pct>=75 ? 'var(--lime)' : pct>=50 ? 'var(--yellow)' : '#ff4444';
  const msg = pct>=80 ? 'CLEAN.' : pct>=60 ? 'DECENT.' : pct>=40 ? 'GRIND MORE.' : 'GO AGAIN.';

  return (
    <div style={{ minHeight:'calc(100vh - 52px)', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div className="fade-up" style={{ width:'100%', maxWidth:480, border:'1.5px solid var(--dim)' }}>

        {/* Score header */}
        <div style={{ padding:'48px 36px 36px', borderBottom:'1.5px solid var(--dim)', textAlign:'center', position:'relative', overflow:'hidden' }}>
          {/* Big bg number */}
          <div style={{
            position:'absolute', inset:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Space Mono, monospace', fontWeight:700,
            fontSize:200, color:'var(--black-2)', lineHeight:1,
            userSelect:'none', pointerEvents:'none',
          }}>{pct}</div>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted)', marginBottom:12 }}>
              Quiz complete ✦
            </div>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:80, fontWeight:700, color:accent, lineHeight:1, marginBottom:8 }}>
              {pct}%
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:'var(--white)', letterSpacing:'-0.3px' }}>{msg}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1.5px solid var(--dim)' }}>
          {[
            { label:'Correct', val:result.correctAnswers, color:'var(--lime)' },
            { label:'Wrong', val:wrong, color:'#ff4444' },
            { label:'Total', val:result.totalQuestions, color:'var(--white)' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'20px', borderRight:i<2?'1.5px solid var(--dim)':'none', textAlign:'center' }}>
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:32, fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding:'20px', display:'flex', gap:10 }}>
          <button onClick={onRetry} className="btn-lime" style={{ flex:1, justifyContent:'center' }}>
            <RotateCcw size={13} /> Try again
          </button>
          <button onClick={onHome} className="btn-outline" style={{ flex:1, justifyContent:'center' }}>
            <Home size={13} /> Library
          </button>
        </div>
      </div>
    </div>
  );
}
