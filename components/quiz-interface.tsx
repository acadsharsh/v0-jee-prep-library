'use client';
import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';

interface QuizInterfaceProps { quiz: QuizJSON; quizId: string; onSubmit: (answers: {[k:string]:string}, timeTaken:number) => Promise<void>; }

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{[k:string]:string}>({});
  const [revealed, setRevealed] = useState<{[k:string]:boolean}>({});
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 2 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [start] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quiz.questions[cur];
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const isCorr = sel === q.correctOptionId;
  const correct = Object.entries(answers).filter(([id,a]) => quiz.questions.find(x=>x.id===id)?.correctOptionId===a).length;
  const fmt = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const isLow = timeLeft < 300;
  const pct = Math.round(((cur+1)/quiz.questions.length)*100);

  const select = (id:string) => { if (isRev) return; setAnswers(p=>({...p,[q.id]:id})); };
  const check = () => { if (!sel) return; setRevealed(p=>({...p,[q.id]:true})); };
  const next = () => { if (cur < quiz.questions.length-1) setCur(p=>p+1); };
  const prev = () => { if (cur > 0) setCur(p=>p-1); };
  const finish = async () => { setSubmitting(true); await onSubmit(answers, Math.floor((Date.now()-start)/1000)); setSubmitting(false); };

  const optClass = (id:string) => {
    const isSel = sel===id; const isC = id===q.correctOptionId;
    if (!isRev) return isSel ? 'opt-selected' : 'opt-default';
    if (isC) return 'opt-correct';
    if (isSel) return 'opt-wrong';
    return 'opt-dim';
  };

  const bubbleColor = (idx:number) => {
    const bq = quiz.questions[idx];
    if (idx===cur) return { bg:'var(--lime)', color:'var(--black)', border:'var(--lime)' };
    if (answers[bq.id]) {
      if (!revealed[bq.id]) return { bg:'transparent', color:'var(--white)', border:'var(--white)' };
      return answers[bq.id]===bq.correctOptionId
        ? { bg:'transparent', color:'var(--mint)', border:'var(--mint)' }
        : { bg:'transparent', color:'#ff4444', border:'#ff4444' };
    }
    return { bg:'transparent', color:'var(--muted)', border:'var(--dim)' };
  };

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 52px)' }}>

      {/* Left sidebar */}
      <div style={{ width:220, flexShrink:0, borderRight:'1.5px solid var(--dim)', background:'var(--black-2)', padding:'20px 16px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* Timer */}
        <div style={{
          padding:'12px',
          border:`1.5px solid ${isLow ? '#ff4444' : 'var(--dim)'}`,
          textAlign:'center',
          fontFamily:'Space Mono, monospace',
          fontSize:24, fontWeight:700,
          color: isLow ? '#ff4444' : 'var(--white)',
          background: isLow ? 'rgba(255,68,68,0.06)' : 'transparent',
        }}>
          {fmt(timeLeft)}
        </div>

        {/* Progress */}
        <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {correct}/{Object.keys(answers).length} correct
        </div>

        {/* Progress bar */}
        <div style={{ height:2, background:'var(--dim)' }}>
          <div style={{ height:'100%', background:'var(--lime)', width:`${pct}%`, transition:'width 0.3s' }} />
        </div>

        {/* Question bubbles */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {quiz.questions.map((_,idx) => {
            const bc = bubbleColor(idx);
            return (
              <button key={idx} onClick={() => setCur(idx)} style={{
                width:28, height:28,
                background:bc.bg,
                color:bc.color,
                border:`1.5px solid ${bc.border}`,
                fontSize:11, fontWeight:700,
                cursor:'pointer',
                fontFamily:'Space Mono, monospace',
                transition:'all 0.1s',
              }}>
                {idx+1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {[
          { color:'var(--lime)', label:'Current' },
          { color:'var(--mint)', label:'Correct' },
          { color:'#ff4444', label:'Wrong' },
          { color:'var(--muted)', label:'Untouched' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, color:'var(--muted)' }}>
            <div style={{ width:8, height:8, background:l.color, flexShrink:0 }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Right — question */}
      <div style={{ flex:1, padding:'32px 40px', maxWidth:740 }}>

        {/* Q header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, paddingBottom:16, borderBottom:'1.5px solid var(--dim)' }}>
          <span style={{ fontFamily:'Space Mono, monospace', fontSize:13, color:'var(--lime)' }}>
            Q{cur+1} <span style={{ color:'var(--muted)' }}>/ {quiz.questions.length}</span>
          </span>
          <span style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            {quiz.quiz_title}
          </span>
        </div>

        <div key={cur} className="fade-up">
          <p style={{ fontSize:16, lineHeight:1.75, color:'var(--white)', marginBottom:28, fontWeight:500 }}>
            {q.questionText}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
            {q.options.map((opt, i) => {
              const isSel = sel===opt.id;
              const isC = opt.id===q.correctOptionId;
              const letters = ['A','B','C','D'];
              return (
                <div key={opt.id} className={optClass(opt.id)} onClick={() => select(opt.id)}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:14,
                    padding:'13px 16px',
                    cursor: isRev ? 'default' : 'pointer',
                    transition:'all 0.1s',
                  }}>
                  <span style={{
                    width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center',
                    border:'1.5px solid currentColor', flexShrink:0,
                    fontFamily:'Space Mono, monospace', fontSize:11, fontWeight:700,
                  }}>{letters[i]}</span>
                  <span style={{ flex:1, fontSize:14, lineHeight:1.55 }}>{opt.text}</span>
                  {isRev && isC && <span style={{ fontSize:11, fontWeight:700, color:'var(--mint)', flexShrink:0, textTransform:'uppercase' }}>✓ Correct</span>}
                  {isRev && isSel && !isC && <span style={{ fontSize:11, fontWeight:700, color:'#ff4444', flexShrink:0, textTransform:'uppercase' }}>✗ Wrong</span>}
                </div>
              );
            })}
          </div>

          {isRev && q.explanation && (
            <div className="fade-up" style={{
              padding:'14px 18px', marginBottom:24,
              borderLeft:`3px solid ${isCorr ? 'var(--mint)' : '#ff4444'}`,
              background:'var(--black-2)',
            }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:isCorr?'var(--mint)':'#ff4444', marginBottom:6 }}>
                {isCorr ? 'Correct' : 'Explanation'}
              </div>
              <p style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.65 }}>{q.explanation}</p>
            </div>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={prev} disabled={cur===0} className="btn-outline" style={{ opacity:cur===0?0.25:1 }}>← Prev</button>
            {!isRev ? (
              <button onClick={check} disabled={!sel} className="btn-lime" style={{ flex:1, justifyContent:'center', opacity:!sel?0.35:1 }}>
                Check answer
              </button>
            ) : cur < quiz.questions.length-1 ? (
              <button onClick={next} className="btn-outline" style={{ flex:1, justifyContent:'center' }}>
                Next →
              </button>
            ) : (
              <button onClick={finish} disabled={submitting} className="btn-lime"
                style={{ flex:1, justifyContent:'center', background:'var(--mint)', borderColor:'var(--mint)' }}>
                {submitting ? 'Submitting…' : 'Finish quiz ✦'}
              </button>
            )}
            <button onClick={next} disabled={cur===quiz.questions.length-1} className="btn-outline"
              style={{ opacity:cur===quiz.questions.length-1?0.25:1 }}>Skip →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
