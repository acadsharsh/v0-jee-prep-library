'use client';
import { useState, useEffect } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface Props { quiz: QuizJSON; quizId: string; onSubmit: (answers:{[k:string]:any}, timeTaken:number, score:number) => Promise<void>; }

function getType(q: QuizQuestion): QuestionType {
  if (q.type) return q.type;
  if (q.correctOptionIds) return 'msq';
  if (q.correctAnswer !== undefined) return 'numerical';
  return 'mcq';
}

export function QuizInterface({ quiz, quizId, onSubmit }: Props) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{[k:string]:any}>({});
  const [revealed, setRevealed] = useState<{[k:string]:boolean}>({});
  const [numInput, setNumInput] = useState<{[k:string]:string}>({});
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 2 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [start] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quiz.questions[cur];
  const qType = getType(q);
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const letters = ['A','B','C','D','E'];

  const calcScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const t=getType(question); const a=answers[question.id];
      if(t==='mcq'&&a===question.correctOptionId)correct++;
      else if(t==='msq'&&Array.isArray(a)){const cs=new Set(question.correctOptionIds??[]);const as_=new Set(a as string[]);if(cs.size===as_.size&&[...cs].every(x=>as_.has(x)))correct++;}
      else if(t==='numerical'){const num=parseFloat(a);if(!isNaN(num)&&Math.abs(num-(question.correctAnswer??0))<=(question.tolerance??0))correct++;}
    });
    return Math.round((correct/quiz.questions.length)*100);
  };

  const selectMCQ=(optId:string)=>{if(isRev)return;setAnswers(p=>({...p,[q.id]:optId}));};
  const toggleMSQ=(optId:string)=>{if(isRev)return;const c=(answers[q.id] as string[])??[];setAnswers(p=>({...p,[q.id]:c.includes(optId)?c.filter((x:string)=>x!==optId):[...c,optId]}));};
  const canCheck=qType==='numerical'?!!(numInput[q.id]?.trim()):qType==='msq'?!!(sel&&(sel as string[]).length>0):!!sel;
  const check=()=>{if(qType==='numerical')setAnswers(p=>({...p,[q.id]:numInput[q.id]??''}));if(!canCheck)return;setRevealed(p=>({...p,[q.id]:true}));};
  const next=()=>{if(cur<quiz.questions.length-1)setCur(p=>p+1);};
  const prev=()=>{if(cur>0)setCur(p=>p-1);};
  const finish=async()=>{setSubmitting(true);await onSubmit(answers,Math.floor((Date.now()-start)/1000),calcScore());setSubmitting(false);};

  const mcqStyle=(optId:string)=>{const isSel=sel===optId;const isC=optId===q.correctOptionId;if(!isRev)return isSel?'sel':'';if(isC)return'correct';if(isSel)return'wrong';return'';};
  const msqStyle=(optId:string)=>{const s=(sel as string[])??[];const isSel=s.includes(optId);const isC=(q.correctOptionIds??[]).includes(optId);if(!isRev)return isSel?'sel':'';if(isC)return'correct';if(isSel)return'wrong';return'';};
  const numCorrect=()=>{const num=parseFloat(answers[q.id]);return!isNaN(num)&&Math.abs(num-(q.correctAnswer??0))<=(q.tolerance??0);};
  const answered=Object.keys(answers).filter(k=>{const v=answers[k];return v!==undefined&&v!==''&&(!Array.isArray(v)||v.length>0);}).length;

  return (
    <div className="quiz-wrap">
      {/* Top bar — image 2 exact */}
      <div className="quiz-topbar">
        <button onClick={() => window.history.back()} style={{ background:'none',border:'none',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:20 }}>←</button>
        <div style={{ fontSize:13,fontWeight:500,color:'rgba(255,255,255,.6)' }}>
          {quiz.quiz_title}
        </div>
        <div style={{ width:36,height:36,borderRadius:10,background:'rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
          ⚙️
        </div>
      </div>

      {/* Question card */}
      <div className="qcard" style={{ paddingBottom:120 }}>
        {/* Q meta — image 2 style */}
        <div className="qmeta-row">
          <span style={{ fontSize:14,fontWeight:600,color:'rgba(255,255,255,.8)' }}>Q {cur+1}</span>
          <div style={{ height:14,width:1,background:'rgba(255,255,255,.15)' }} />
          <span className="qsource">Practice set</span>
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:10 }}>
            <div className="timer-pill">
              🕐 {fmt(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question text */}
        <div className="qtxt-block">
          {qType === 'msq' && (
            <div style={{ fontSize:12,fontWeight:700,color:'#22C55E',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em' }}>
              ✦ Multiple correct — select all that apply
            </div>
          )}
          {q.questionText}
        </div>

        {/* MCQ options — 2-column grid like image 2 */}
        {qType==='mcq'&&q.options&&(
          <div className="qopts-grid">
            {q.options.map((opt,i)=>{
              const cls=mcqStyle(opt.id);
              const isSel=sel===opt.id;const isC=opt.id===q.correctOptionId;
              return(
                <div key={opt.id} className={`qopt${cls?' locked':''} ${cls}`} onClick={()=>selectMCQ(opt.id)} style={{ cursor:isRev?'default':'pointer' }}>
                  <div className="obub">{letters[i]}</div>
                  <div className="otxt">{opt.text}</div>
                  {isRev&&isC&&<span style={{ fontSize:11,fontWeight:700,color:'#22C55E',flexShrink:0,marginLeft:'auto' }}>✓</span>}
                  {isRev&&isSel&&!isC&&<span style={{ fontSize:11,fontWeight:700,color:'#EF4444',flexShrink:0,marginLeft:'auto' }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MSQ */}
        {qType==='msq'&&q.options&&(
          <div className="qopts-grid">
            {q.options.map((opt,i)=>{
              const cls=msqStyle(opt.id);
              const selArr=(sel as string[])??[];const isSel=selArr.includes(opt.id);const isC=(q.correctOptionIds??[]).includes(opt.id);
              return(
                <div key={opt.id} className={`qopt${cls?' locked':''} ${cls}`} onClick={()=>toggleMSQ(opt.id)} style={{ cursor:isRev?'default':'pointer' }}>
                  <div className="obub" style={{ borderRadius:6,background:isSel?'var(--pu)':'transparent',borderColor:isSel?'var(--pu)':'rgba(255,255,255,.25)',color:isSel?'#fff':'rgba(255,255,255,.5)' }}>
                    {isSel?'✓':letters[i]}
                  </div>
                  <div className="otxt">{opt.text}</div>
                  {isRev&&isC&&<span style={{ fontSize:11,fontWeight:700,color:'#22C55E',flexShrink:0,marginLeft:'auto' }}>✓</span>}
                  {isRev&&isSel&&!isC&&<span style={{ fontSize:11,fontWeight:700,color:'#EF4444',flexShrink:0,marginLeft:'auto' }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Numerical */}
        {qType==='numerical'&&(
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10 }}>
              Enter answer {q.tolerance?`(±${q.tolerance})`:'' }
            </div>
            <input type="number" step="any" placeholder="0"
              value={numInput[q.id]??''} disabled={isRev}
              onChange={e=>{setNumInput(p=>({...p,[q.id]:e.target.value}));if(!isRev)setAnswers(p=>({...p,[q.id]:e.target.value}));}}
              style={{
                width:180,fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,
                background:'rgba(255,255,255,.07)',border:`1.5px solid ${isRev?(numCorrect()?'#22C55E':'#EF4444'):'rgba(255,255,255,.15)'}`,
                borderRadius:12,padding:'12px 16px',color:isRev?(numCorrect()?'#22C55E':'#EF4444'):'#fff',outline:'none',
              }}
            />
            {isRev&&<div style={{ marginTop:10,fontSize:13,fontWeight:600,color:'rgba(255,255,255,.6)' }}>Correct: <span style={{ color:'#22C55E' }}>{q.correctAnswer}</span>{q.tolerance&&<span style={{ color:'rgba(255,255,255,.35)' }}> ±{q.tolerance}</span>}</div>}
          </div>
        )}

        {/* Explanation */}
        {isRev&&q.explanation&&(
          <div style={{ background:'rgba(252,211,77,.08)',border:'1.5px solid rgba(252,211,77,.3)',borderRadius:'var(--r)',padding:18,marginTop:0,marginBottom:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:8 }}>
              <span style={{ fontSize:14 }}>💡</span>
              <span style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'rgba(252,211,77,.9)' }}>Solution</span>
            </div>
            <p style={{ fontSize:13.5,lineHeight:1.7,color:'rgba(255,255,255,.7)' }}>{q.explanation}</p>
          </div>
        )}

        {/* Question nav bubbles */}
        <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:8 }}>
          {quiz.questions.map((_,idx)=>{
            const bq=quiz.questions[idx];const isCur=idx===cur;
            const hasAns=answers[bq.id]!==undefined&&answers[bq.id]!=='';
            const isCorr=hasAns&&revealed[bq.id]&&(getType(bq)==='mcq'?answers[bq.id]===bq.correctOptionId:true);
            const isWrong=hasAns&&revealed[bq.id]&&(getType(bq)==='mcq'?answers[bq.id]!==bq.correctOptionId:false);
            return(
              <button key={idx} onClick={()=>setCur(idx)} style={{
                width:32,height:32,borderRadius:8,border:'1.5px solid',
                fontSize:12,fontWeight:700,cursor:'pointer',
                fontFamily:'Syne,sans-serif',transition:'all 0.12s',
                background:isCur?'var(--pu)':isCorr?'rgba(34,197,94,.15)':isWrong?'rgba(239,68,68,.15)':hasAns?'rgba(124,111,247,.15)':'rgba(255,255,255,.06)',
                borderColor:isCur?'var(--pu)':isCorr?'#22C55E':isWrong?'#EF4444':hasAns?'rgba(124,111,247,.5)':'rgba(255,255,255,.15)',
                color:isCur?'#fff':isCorr?'#22C55E':isWrong?'#EF4444':hasAns?'var(--pu)':'rgba(255,255,255,.4)',
              }}>{idx+1}</button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar — image 2 exact */}
      <div className="qbottom">
        <button className="qbprev" onClick={prev} disabled={cur===0} style={{ opacity:cur===0?0.3:1 }}>Previous</button>
        {!isRev?(
          <button className={`qbcheck${canCheck?' ready':''}`} onClick={check} disabled={!canCheck}>
            Check Answer
          </button>
        ):(
          <button className="qbcheck ready" onClick={cur<quiz.questions.length-1?next:finish} disabled={submitting}>
            {cur<quiz.questions.length-1?'Next →':submitting?'Saving…':'Finish'}
          </button>
        )}
        <button className="qbnext" onClick={cur<quiz.questions.length-1?next:finish}>
          {cur<quiz.questions.length-1?'Next':'Finish'}
        </button>
      </div>
    </div>
  );
}
