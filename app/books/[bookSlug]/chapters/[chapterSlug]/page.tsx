'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizResults } from '@/components/quiz-results';
import { QuizJSON } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface QuizData { id:string; content:QuizJSON; title:string; difficulty:string|null; description:string|null; }

export default function ChapterPracticePage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const { user } = useAuth();
  const [sets, setSets] = useState<QuizData[]>([]);
  const [activeSet, setActiveSet] = useState<QuizData|null>(null);
  const [result, setResult] = useState<{correctAnswers:number;totalQuestions:number;answers:Record<string,string>;score:number}|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      try{
        const cr=await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters=await cr.json();
        let chapterId:string|null=null;
        for(const arr of Object.values(chapters)){const found=(arr as any[]).find(ch=>ch.slug===chapterSlug);if(found){chapterId=found.id;break;}}
        if(!chapterId)throw new Error('Chapter not found');
        const qr=await fetch(`/api/quizzes/${chapterId}`);
        if(!qr.ok){const e=await qr.json();throw new Error(e.error||'No practice sets found');}
        const data=await qr.json();
        const arr=Array.isArray(data)?data:[data];
        setSets(arr);
        if(arr.length===1)setActiveSet(arr[0]);
      }catch(e:any){setError(e.message);}
      finally{setIsLoading(false);}
    })();
  },[bookSlug,chapterSlug]);

  const handleSubmit=async(answers:{[k:string]:any},timeTaken:number,score:number)=>{
    const correctAnswers=activeSet?.content.questions.filter(q=>{const a=answers[q.id];if(!a)return false;if(!q.type||q.type==='mcq')return a===q.correctOptionId;if(q.type==='msq'){const cs=new Set(q.correctOptionIds??[]);const as_=new Set(Array.isArray(a)?a:[a]);return cs.size===as_.size&&[...cs].every(x=>as_.has(x));}if(q.type==='numerical'){const num=parseFloat(a);return!isNaN(num)&&Math.abs(num-(q.correctAnswer??0))<=(q.tolerance??0);}return false;}).length??0;
    if(user&&activeSet){const{error:e}=await supabase.from('quiz_attempts').insert({user_id:user.id,quiz_id:activeSet.id,score,time_taken_seconds:timeTaken});if(e)console.error('Save failed:',e.message);}
    setResult({correctAnswers,totalQuestions:activeSet?.content.questions.length??0,answers:answers as Record<string,string>,score});
    setActiveSet(null);
  };

  const ini = user?.email?.slice(0,2).toUpperCase()??'U';
  const name = user?.email?.split('@')[0]??'User';

  return (
    <div className="dbshell">
      <Navigation />
      <div className="sbmain">
        {result?(
          <QuizResults result={result} onRetry={()=>{setResult(null);if(sets.length===1)setActiveSet(sets[0]);}} onHome={()=>setResult(null)} />
        ):activeSet?(
          <QuizInterface quiz={activeSet.content} quizId={activeSet.id} onSubmit={handleSubmit} />
        ):(
          <>
            <div className="dbtop">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <Link href={`/books/${bookSlug}`} style={{fontSize:13,color:'var(--mu)',fontWeight:500}}>← Chapters</Link>
                <span style={{color:'var(--bd)'}}>/</span>
                <div className="tbtitle">{chapterSlug.split('-').slice(1).join(' ') || 'Practice'}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div className="nbtn">🔔<span className="ndot"/></div>
                <div className="uchip"><div className="ucav">{ini}</div><span className="ucname">{name}</span></div>
              </div>
            </div>

            <div className="sub active">
              {isLoading?(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 0'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid var(--pul)',borderTopColor:'var(--pu)',animation:'spin 0.8s linear infinite'}}/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ):sets.length>0?(
                <div style={{maxWidth:640}}>
                  <h2 style={{fontFamily:'Syne,sans-serif',fontSize:21,fontWeight:800,marginBottom:5}}>Select Practice Set</h2>
                  <p style={{fontSize:13,color:'var(--mu)',marginBottom:20}}>{chapterSlug.split('-').slice(1).join(' ')}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {sets.map(s=>(
                      <div key={s.id} onClick={()=>setActiveSet(s)} style={{background:'#fff',borderRadius:'var(--r)',padding:'20px 24px',border:'1.5px solid var(--bd)',cursor:'pointer',display:'flex',alignItems:'center',gap:16,transition:'all .15s'}}
                        onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='var(--pu)';el.style.transform='translateY(-2px)';el.style.boxShadow='var(--shl)';}}
                        onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='var(--bd)';el.style.transform='translateY(0)';el.style.boxShadow='none';}}
                      >
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:6}}>{s.title}</div>
                          <div style={{display:'flex',gap:10,alignItems:'center'}}>
                            {s.difficulty&&<span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',padding:'3px 10px',borderRadius:100,background:s.difficulty==='easy'?'var(--gnl)':s.difficulty==='hard'?'var(--rdl)':'var(--ywl)',color:s.difficulty==='easy'?'#166534':s.difficulty==='hard'?'#991B1B':'#854D0E'}}>{s.difficulty}</span>}
                            <span style={{fontSize:11,color:'var(--mu)',fontWeight:500}}>{s.content?.questions?.length??0} questions</span>
                          </div>
                        </div>
                        <span style={{fontSize:20,color:'var(--mu)'}}>→</span>
                      </div>
                    ))}
                  </div>
                </div>
              ):(
                <div style={{textAlign:'center',padding:'80px 0'}}>
                  <div style={{fontSize:48,marginBottom:12}}>📭</div>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,marginBottom:8}}>No practice sets yet</h3>
                  <p style={{color:'var(--mu)',fontSize:14,marginBottom:20}}>Questions haven't been uploaded for this chapter.</p>
                  {error&&<p style={{color:'var(--rd)',fontSize:12,marginBottom:16}}>{error}</p>}
                  <button className="backbtn" onClick={()=>window.history.back()}>← Back to chapters</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
