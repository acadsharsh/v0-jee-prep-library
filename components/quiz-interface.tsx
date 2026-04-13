'use client';
import { useState, useEffect } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';

interface Props { quiz:QuizJSON; quizId:string; onSubmit:(answers:{[k:string]:any},timeTaken:number,score:number)=>Promise<void>; }

function getType(q:QuizQuestion):QuestionType{if(q.type)return q.type;if(q.correctOptionIds)return'msq';if(q.correctAnswer!==undefined)return'numerical';return'mcq';}

export function QuizInterface({ quiz, quizId, onSubmit }:Props) {
  const [cur,setCur]=useState(0);
  const [answers,setAnswers]=useState<{[k:string]:any}>({});
  const [revealed,setRevealed]=useState<{[k:string]:boolean}>({});
  const [numInput,setNumInput]=useState<{[k:string]:string}>({});
  const [timeLeft,setTimeLeft]=useState(quiz.questions.length*2*60);
  const [submitting,setSubmitting]=useState(false);
  const [start]=useState(Date.now());

  useEffect(()=>{const t=setInterval(()=>setTimeLeft(p=>Math.max(0,p-1)),1000);return()=>clearInterval(t);},[]);

  const q=quiz.questions[cur];
  const qType=getType(q);
  const sel=answers[q.id];
  const isRev=revealed[q.id];
  const isLow=timeLeft<300;
  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const LETTERS=['A','B','C','D','E'];

  const calcScore=()=>{let c=0;quiz.questions.forEach(question=>{const t=getType(question);const a=answers[question.id];if(t==='mcq'&&a===question.correctOptionId)c++;else if(t==='msq'&&Array.isArray(a)){const cs=new Set(question.correctOptionIds??[]);const as_=new Set(a as string[]);if(cs.size===as_.size&&[...cs].every(x=>as_.has(x)))c++;}else if(t==='numerical'){const num=parseFloat(a);if(!isNaN(num)&&Math.abs(num-(question.correctAnswer??0))<=(question.tolerance??0))c++;}});return Math.round((c/quiz.questions.length)*100);};

  const selectMCQ=(id:string)=>{if(isRev)return;setAnswers(p=>({...p,[q.id]:id}));};
  const toggleMSQ=(id:string)=>{if(isRev)return;const c=(answers[q.id] as string[])??[];setAnswers(p=>({...p,[q.id]:c.includes(id)?c.filter((x:string)=>x!==id):[...c,id]}));};
  const canCheck=qType==='numerical'?!!(numInput[q.id]?.trim()):qType==='msq'?!!(sel&&(sel as string[]).length>0):!!sel;
  const check=()=>{if(qType==='numerical')setAnswers(p=>({...p,[q.id]:numInput[q.id]??''}));if(!canCheck)return;setRevealed(p=>({...p,[q.id]:true}));};
  const next=()=>{if(cur<quiz.questions.length-1)setCur(p=>p+1);};
  const prev=()=>{if(cur>0)setCur(p=>p-1);};
  const finish=async()=>{setSubmitting(true);await onSubmit(answers,Math.floor((Date.now()-start)/1000),calcScore());setSubmitting(false);};

  const mcqCls=(optId:string)=>{const isSel=sel===optId;const isC=optId===q.correctOptionId;if(!isRev)return isSel?'sel':'';if(isC)return'correct';if(isSel)return'wrong';return'dim';};
  const msqCls=(optId:string)=>{const s=(sel as string[])??[];const isSel=s.includes(optId);const isC=(q.correctOptionIds??[]).includes(optId);if(!isRev)return isSel?'sel':'';if(isC)return'correct';if(isSel)return'wrong';return'dim';};
  const numOk=()=>{const num=parseFloat(answers[q.id]);return!isNaN(num)&&Math.abs(num-(q.correctAnswer??0))<=(q.tolerance??0);};

  const answered=Object.keys(answers).filter(k=>{const v=answers[k];return v!==undefined&&v!==''&&(!Array.isArray(v)||v.length>0);}).length;
  const pct=Math.round(((cur+1)/quiz.questions.length)*100);

  const bubCls=(idx:number)=>{const bq=quiz.questions[idx];const isCur=idx===cur;const hasA=answers[bq.id]!==undefined&&answers[bq.id]!=='';const isRev_=revealed[bq.id];if(isCur)return'current';if(hasA&&isRev_){const t=getType(bq);let ok=false;if(t==='mcq')ok=answers[bq.id]===bq.correctOptionId;else if(t==='msq'){const cs=new Set(bq.correctOptionIds??[]);const as_=new Set(answers[bq.id] as string[]);ok=cs.size===as_.size&&[...cs].every(x=>as_.has(x));}else{const num=parseFloat(answers[bq.id]);ok=!isNaN(num)&&Math.abs(num-(bq.correctAnswer??0))<=(bq.tolerance??0);}return ok?'correct':'wrong';}if(hasA)return'answered';return'';};

  return (
    <div className="neo-quiz-wrap">
      {/* Top bar */}
      <div className="neo-quiz-top">
        <button onClick={()=>window.history.back()} style={{background:'none',border:'none',color:'#f5d90a',cursor:'pointer',fontSize:18,fontFamily:'Space Mono,monospace',fontWeight:700}}>← BACK</button>
        <div style={{fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:'0.08em'}}>{quiz.quiz_title}</div>
        <div className={`neo-timer${isLow?' low':''}`}>{fmt(timeLeft)}</div>
      </div>

      {/* Progress bar */}
      <div className="neo-progress-wrap">
        <div className="neo-progress-fill" style={{width:`${pct}%`}}/>
      </div>

      <div className="neo-quiz-content">
        {/* Q header */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
          <div className="neo-qnum">Q {cur+1} / {quiz.questions.length}</div>
          <div style={{height:2,flex:1,background:'#333'}}/>
          <span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',padding:'3px 10px',border:'1.5px solid #333'}}>{qType.toUpperCase()}</span>
        </div>

        {/* Question text */}
        <div className="neo-qtxt">
          {qType==='msq'&&<div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#0fd68a',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>// MULTIPLE CORRECT — SELECT ALL THAT APPLY</div>}
          {q.questionText}
        </div>

        {/* MCQ */}
        {qType==='mcq'&&q.options&&(
          <div className="neo-opt-grid" style={{marginBottom:24}}>
            {q.options.map((opt,i)=>{
              const cls=mcqCls(opt.id);const isSel=sel===opt.id;const isC=opt.id===q.correctOptionId;
              return(
                <div key={opt.id} className={`neo-dark-opt locked ${cls}`} onClick={()=>selectMCQ(opt.id)} style={{cursor:isRev?'default':'pointer'}}>
                  <div className="neo-dark-obub">{LETTERS[i]}</div>
                  <div style={{fontSize:14,lineHeight:1.55,flex:1,color:'#ddd'}}>{opt.text}</div>
                  {isRev&&isC&&<span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#0fd68a',flexShrink:0}}>✓</span>}
                  {isRev&&isSel&&!isC&&<span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#ff4d4d',flexShrink:0}}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MSQ */}
        {qType==='msq'&&q.options&&(
          <div className="neo-opt-grid" style={{marginBottom:24}}>
            {q.options.map((opt,i)=>{
              const cls=msqCls(opt.id);const selArr=(sel as string[])??[];const isSel=selArr.includes(opt.id);const isC=(q.correctOptionIds??[]).includes(opt.id);
              return(
                <div key={opt.id} className={`neo-dark-opt locked ${cls}`} onClick={()=>toggleMSQ(opt.id)} style={{cursor:isRev?'default':'pointer'}}>
                  <div className="neo-dark-obub" style={{borderRadius:0,background:isSel?'#f5d90a':'transparent',borderColor:isSel?'#f5d90a':'#555',color:isSel?'#0a0a0a':'#666'}}>{isSel?'✓':LETTERS[i]}</div>
                  <div style={{fontSize:14,lineHeight:1.55,flex:1,color:'#ddd'}}>{opt.text}</div>
                  {isRev&&isC&&<span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#0fd68a',flexShrink:0}}>✓</span>}
                  {isRev&&isSel&&!isC&&<span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#ff4d4d',flexShrink:0}}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Numerical */}
        {qType==='numerical'&&(
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>
              // ENTER ANSWER{q.tolerance?` (±${q.tolerance})`:''}
            </div>
            <input type="number" step="any" placeholder="0"
              value={numInput[q.id]??''} disabled={isRev}
              onChange={e=>{setNumInput(p=>({...p,[q.id]:e.target.value}));if(!isRev)setAnswers(p=>({...p,[q.id]:e.target.value}));}}
              style={{width:180,fontFamily:'Space Mono,monospace',fontSize:22,fontWeight:700,padding:'12px 16px',background:'#1a1a1a',border:`3px solid ${isRev?(numOk()?'#0fd68a':'#ff4d4d'):'#f5d90a'}`,color:isRev?(numOk()?'#0fd68a':'#ff4d4d'):'#f5d90a',outline:'none'}}
            />
            {isRev&&<div style={{marginTop:10,fontFamily:'Space Mono,monospace',fontSize:13,fontWeight:700,color:'#666'}}>ANSWER: <span style={{color:'#0fd68a'}}>{q.correctAnswer}</span>{q.tolerance&&<span style={{color:'#555'}}> ±{q.tolerance}</span>}</div>}
          </div>
        )}

        {/* Explanation */}
        {isRev&&q.explanation&&(
          <div style={{background:'#1a1800',border:'3px solid #f5d90a',padding:'16px 18px',marginBottom:20}}>
            <div style={{fontFamily:'Space Mono,monospace',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#f5d90a',marginBottom:8}}>// SOLUTION</div>
            <p style={{fontSize:13.5,lineHeight:1.7,color:'#aaa'}}>{q.explanation}</p>
          </div>
        )}

        {/* Q nav bubbles */}
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
          {quiz.questions.map((_,idx)=>(
            <button key={idx} onClick={()=>setCur(idx)} className={`neo-bubble ${bubCls(idx)}`}>{idx+1}</button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="neo-quiz-bottom">
        <button onClick={prev} disabled={cur===0} style={{fontFamily:'Space Mono,monospace',fontSize:13,fontWeight:700,background:'none',border:'none',color:cur===0?'#333':'#777',cursor:cur===0?'not-allowed':'pointer',textTransform:'uppercase',letterSpacing:'0.04em'}}>
          ← Prev
        </button>

        {!isRev?(
          <button onClick={check} disabled={!canCheck} style={{flex:1,maxWidth:340,padding:14,background:canCheck?'#f5d90a':'#1a1a1a',color:canCheck?'#0a0a0a':'#444',border:`3px solid ${canCheck?'#f5d90a':'#333'}`,fontFamily:'Space Grotesk,sans-serif',fontSize:14,fontWeight:700,cursor:canCheck?'pointer':'not-allowed',textTransform:'uppercase',letterSpacing:'0.05em',boxShadow:canCheck?'4px 4px 0 #f5d90a33':undefined}}>
            CHECK ANSWER
          </button>
        ):(
          <button onClick={cur<quiz.questions.length-1?next:finish} disabled={submitting} style={{flex:1,maxWidth:340,padding:14,background:'#f5d90a',color:'#0a0a0a',border:'3px solid #f5d90a',fontFamily:'Space Grotesk,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.05em',boxShadow:'4px 4px 0 #f5d90a33'}}>
            {cur<quiz.questions.length-1?'NEXT →':submitting?'SAVING…':'FINISH ✓'}
          </button>
        )}

        <button onClick={cur<quiz.questions.length-1?next:finish} style={{fontFamily:'Space Mono,monospace',fontSize:13,fontWeight:700,background:'#fff',color:'#0a0a0a',border:'3px solid #fff',padding:'10px 20px',cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.04em'}}>
          {cur<quiz.questions.length-1?'Skip →':'Finish'}
        </button>
      </div>
    </div>
  );
}
