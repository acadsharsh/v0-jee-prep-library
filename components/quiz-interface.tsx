'use client';
import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';

interface QuizInterfaceProps {
  quiz: QuizJSON;
  quizId: string;
  onSubmit: (answers: { [key:string]:string }, timeTaken:number) => Promise<void>;
}

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key:string]:string }>({});
  const [revealed, setRevealed] = useState<{ [key:string]:boolean }>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.questions.length * 2 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => { if (prev<=0){clearInterval(timer);return 0;} return prev-1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const isRevealed = revealed[question.id];
  const isCorrect = selectedAnswer === question.correctOptionId;
  const answeredCount = Object.keys(answers).length;
  const correctCount = quiz.questions.filter(q => answers[q.id] === q.correctOptionId).length;

  const formatTime = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const isLow = timeRemaining < 300;

  const handleSelect = (optionId:string) => {
    if (isRevealed) return;
    setAnswers(prev => ({ ...prev, [question.id]:optionId }));
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setRevealed(prev => ({ ...prev, [question.id]:true }));
  };

  const handleNext = () => { if (currentQuestion < quiz.questions.length-1) setCurrentQuestion(p=>p+1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try { await onSubmit(answers, Math.floor((Date.now()-startTime)/1000)); }
    finally { setIsSubmitting(false); }
  };

  const getOptStyle = (optId:string) => {
    if (!isRevealed) return selectedAnswer===optId ? 'sel' : 'def';
    if (optId===question.correctOptionId) return 'ok';
    if (optId===selectedAnswer) return 'er';
    return 'dim';
  };

  const getBubClass = (idx:number) => {
    const q = quiz.questions[idx];
    if (idx===currentQuestion) return 'bc';
    if (revealed[q.id]) return answers[q.id]===q.correctOptionId ? 'bk' : 'bw';
    if (answers[q.id]) return 'ba';
    return '';
  };

  const pct = Math.round(((currentQuestion+1)/quiz.questions.length)*100);

  return (
    <>
      <style>{`
        .opt-def{border-color:rgba(255,255,255,0.08);background:#141414;color:rgba(255,255,255,0.85)}
        .opt-def:hover{border-color:rgba(255,210,63,0.4);background:rgba(255,210,63,0.05);cursor:pointer}
        .opt-sel{border-color:#FFD23F;background:rgba(255,210,63,0.1);color:#FFD23F}
        .opt-ok{border-color:#4CAF7D;background:rgba(76,175,125,0.1);color:#4CAF7D}
        .opt-er{border-color:#FF5252;background:rgba(255,82,82,0.1);color:#FF5252}
        .opt-dim{border-color:rgba(255,255,255,0.04);background:#141414;color:rgba(255,255,255,0.25);cursor:default;opacity:.5}
        .bub{width:28px;height:28px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.1);font-size:10px;font-weight:700;cursor:pointer;display:grid;place-items:center;color:rgba(255,255,255,0.35);background:transparent;font-family:'Space Grotesk',sans-serif;transition:all .12s}
        .bub.bc{border-color:#FFD23F;background:rgba(255,210,63,0.15);color:#FFD23F}
        .bub.ba{border-color:rgba(255,255,255,0.25);background:#222;color:rgba(255,255,255,0.7)}
        .bub.bk{border-color:#4CAF7D;background:rgba(76,175,125,0.15);color:#4CAF7D}
        .bub.bw{border-color:#FF5252;background:rgba(255,82,82,0.15);color:#FF5252}
        @keyframes expIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 0 60px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:16 }}>
          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:24, color:'#fff', letterSpacing:'-0.3px', flex:1, lineHeight:1.2 }}>{quiz.quiz_title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:20, background: isLow?'rgba(255,82,82,0.15)':'rgba(255,210,63,0.12)', border:`1.5px solid ${isLow?'rgba(255,82,82,0.4)':'rgba(255,210,63,0.3)'}`, flexShrink:0 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:isLow?'#FF5252':'#FFD23F', animation:isLow?'expIn .5s ease infinite alternate':undefined }} />
            <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:800, fontSize:14, color:isLow?'#FF5252':'#FFD23F', fontVariantNumeric:'tabular-nums' }}>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:99, marginBottom:6, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'#FFD23F', borderRadius:99, width:`${pct}%`, transition:'width .4s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:24 }}>
          <span>Question {currentQuestion+1} of {quiz.questions.length}{answeredCount>0&&` · ${answeredCount} answered`}</span>
          <span style={{ color:'#4CAF7D', fontWeight:700 }}>{correctCount}/{answeredCount} correct</span>
        </div>

        {/* Question card */}
        <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'28px', marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.09em', textTransform:'uppercase', color:'#FFD23F', marginBottom:10 }}>
            Q{currentQuestion+1} · Multiple choice
          </div>
          <p style={{ fontSize:16, lineHeight:1.75, color:'rgba(255,255,255,0.9)', marginBottom:22 }}>{question.questionText}</p>

          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {question.options.map(opt => {
              const st = getOptStyle(opt.id);
              const isSel = selectedAnswer===opt.id;
              const isCorr = opt.id===question.correctOptionId;
              return (
                <div key={opt.id} className={`opt-${st}`} onClick={() => handleSelect(opt.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:11, border:'1.5px solid', transition:'all .15s', fontSize:14 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', border:'1.5px solid currentColor', flexShrink:0, display:'grid', placeItems:'center' }}>
                    {(isSel||(isRevealed&&isCorr)) && <div style={{ width:8, height:8, borderRadius:'50%', background:'currentColor' }} />}
                  </div>
                  <span style={{ flex:1, lineHeight:1.45 }}>{opt.text}</span>
                  {isRevealed && isCorr && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:4, background:'rgba(76,175,125,0.2)', color:'#4CAF7D', flexShrink:0 }}>Correct</span>}
                  {isRevealed && isSel && !isCorr && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:4, background:'rgba(255,82,82,0.2)', color:'#FF5252', flexShrink:0 }}>Wrong</span>}
                </div>
              );
            })}
          </div>

          {isRevealed && question.explanation && (
            <div style={{ marginTop:16, padding:'14px 16px', background:'#0d0d0d', borderLeft:`3px solid ${isCorrect?'#4CAF7D':'#FF5252'}`, fontSize:13, lineHeight:1.65, color:'rgba(255,255,255,0.55)', animation:'expIn .25s ease' }}>
              <div style={{ fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:5, fontSize:12 }}>
                {isCorrect ? 'Correct!' : 'Not quite —'} here&apos;s why:
              </div>
              {question.explanation}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <button onClick={() => setCurrentQuestion(p=>Math.max(0,p-1))} disabled={currentQuestion===0}
            style={{ padding:'10px 18px', borderRadius:9, background:'transparent', border:'1.5px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}
            onMouseEnter={e=>{if(currentQuestion>0)(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.25)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'}}
          >← Prev</button>

          <div style={{ flex:1, display:'flex', gap:8, justifyContent:'center' }}>
            {!isRevealed ? (
              <button onClick={handleCheck} disabled={!selectedAnswer}
                style={{ padding:'10px 24px', borderRadius:9, background:selectedAnswer?'#FFD23F':'rgba(255,210,63,0.15)', border:'none', color:selectedAnswer?'#0d0d0d':'rgba(255,210,63,0.4)', fontSize:13, fontWeight:800, cursor:selectedAnswer?'pointer':'not-allowed', fontFamily:'Space Grotesk,sans-serif', transition:'all .15s' }}>
                Check Answer
              </button>
            ) : (
              currentQuestion < quiz.questions.length-1 ? (
                <button onClick={handleNext}
                  style={{ padding:'10px 24px', borderRadius:9, background:'#141414', border:'1.5px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>
                  Next Question →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting}
                  style={{ padding:'10px 24px', borderRadius:9, background:'#4CAF7D', border:'none', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', opacity:isSubmitting?0.6:1 }}>
                  {isSubmitting ? 'Submitting…' : 'Finish Quiz'}
                </button>
              )
            )}
          </div>

          <button onClick={() => { if (currentQuestion<quiz.questions.length-1) setCurrentQuestion(p=>p+1); }}
            disabled={currentQuestion===quiz.questions.length-1}
            style={{ padding:'10px 18px', borderRadius:9, background:'transparent', border:'1.5px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            Skip
          </button>
        </div>

        {/* Bubble nav */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
          {quiz.questions.map((q,idx) => (
            <button key={q.id} className={`bub ${getBubClass(idx)}`} onClick={() => setCurrentQuestion(idx)}>{idx+1}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
          {[['#222','rgba(255,255,255,0.25)','Answered'],['rgba(76,175,125,0.15)','#4CAF7D','Correct'],['rgba(255,82,82,0.15)','#FF5252','Wrong'],['transparent','rgba(255,255,255,0.1)','Not visited']].map(([bg,bd,label])=>(
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(255,255,255,0.3)' }}>
              <div style={{ width:9, height:9, borderRadius:2, background:bg, border:`1px solid ${bd}` }}/>
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
