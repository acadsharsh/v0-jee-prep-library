'use client';
import{useEffect,useState}from'react';
import{useParams}from'next/navigation';
import{Navigation}from'@/components/navigation';
import{QuizInterface}from'@/components/quiz-interface';
import{QuizResults}from'@/components/quiz-results';
import{QuizJSON}from'@/lib/types';
import{supabase}from'@/lib/supabase';
import{useAuth}from'@/lib/auth-context';
import Link from'next/link';

interface QuizData{id:string;content:QuizJSON;title:string;difficulty:string|null;description:string|null;}

export default function ChapterPracticePage(){
  const params=useParams();const bookSlug=params.bookSlug as string;const chapterSlug=params.chapterSlug as string;
  const{user}=useAuth();
  const[sets,setSets]=useState<QuizData[]>([]);
  const[activeSet,setActiveSet]=useState<QuizData|null>(null);
  const[result,setResult]=useState<{correctAnswers:number;totalQuestions:number;answers:Record<string,string>;score:number}|null>(null);
  const[isLoading,setIsLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const ini=user?.email?.slice(0,2).toUpperCase()??'JE';

  useEffect(()=>{
    (async()=>{
      try{const cr=await fetch(`/api/books/${bookSlug}/chapters`);const chapters=await cr.json();let chapterId:string|null=null;for(const arr of Object.values(chapters)){const found=(arr as any[]).find(ch=>ch.slug===chapterSlug);if(found){chapterId=found.id;break;}}if(!chapterId)throw new Error('Chapter not found');const qr=await fetch(`/api/quizzes/${chapterId}`);if(!qr.ok){const e=await qr.json();throw new Error(e.error||'No sets found');}const data=await qr.json();const arr=Array.isArray(data)?data:[data];setSets(arr);if(arr.length===1)setActiveSet(arr[0]);}
      catch(e:any){setError(e.message);}finally{setIsLoading(false);}
    })();
  },[bookSlug,chapterSlug]);

  const handleSubmit=async(answers:{[k:string]:any},timeTaken:number,score:number)=>{
    const correctAnswers=activeSet?.content.questions.filter(q=>{const a=answers[q.id];if(!a)return false;if(!q.type||q.type==='mcq')return a===q.correctOptionId;if(q.type==='msq'){const cs=new Set(q.correctOptionIds??[]);const as_=new Set(Array.isArray(a)?a:[a]);return cs.size===as_.size&&[...cs].every(x=>as_.has(x));}if(q.type==='numerical'){const num=parseFloat(a);return!isNaN(num)&&Math.abs(num-(q.correctAnswer??0))<=(q.tolerance??0);}return false;}).length??0;
    if(user&&activeSet){const{error:e}=await supabase.from('quiz_attempts').insert({user_id:user.id,quiz_id:activeSet.id,score,time_taken_seconds:timeTaken});if(e)console.error('Save failed:',e.message);}
    setResult({correctAnswers,totalQuestions:activeSet?.content.questions.length??0,answers:answers as Record<string,string>,score});
    setActiveSet(null);
  };

  return(
    <div className="neo-shell">
      <Navigation/>
      <div className="neo-main">
        {result?(
          <QuizResults result={result} onRetry={()=>{setResult(null);if(sets.length===1)setActiveSet(sets[0]);}} onHome={()=>setResult(null)}/>
        ):activeSet?(
          <QuizInterface quiz={activeSet.content} quizId={activeSet.id} onSubmit={handleSubmit}/>
        ):(
          <>
            <div className="neo-topbar">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <Link href={`/books/${bookSlug}`} style={{fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,color:'#777',textTransform:'uppercase',letterSpacing:'0.05em'}}>← Chapters</Link>
                <span style={{color:'#ccc'}}>/</span>
                <span className="neo-topbar-title">{chapterSlug.split('-').slice(1).join(' ').toUpperCase()||'PRACTICE'}</span>
              </div>
              <div style={{padding:'6px 14px',background:'#0a0a0a',color:'#f5d90a',fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700}}>{ini}</div>
            </div>
            <div style={{padding:'24px'}}>
              {isLoading?(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 0'}}>
                  <div style={{width:36,height:36,border:'4px solid #eee',borderTopColor:'#0a0a0a',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ):sets.length>0?(
                <div style={{maxWidth:600}}>
                  <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#999',marginBottom:12}}>// SELECT PRACTICE SET</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {sets.map(s=>{
                      const dc={easy:'#b8f72b',medium:'#f5d90a',hard:'#ff4d4d',objective:'#f5d90a',subjective:'#b8f72b',numerical:'#ff7a00'}[s.difficulty?.toLowerCase()??'']??'#f5d90a';
                      return(
                        <div key={s.id} onClick={()=>setActiveSet(s)} style={{background:'#fafafa',border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',padding:'20px 24px',cursor:'pointer',display:'flex',alignItems:'center',gap:16,transition:'transform 0.1s, box-shadow 0.1s'}}
                          onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translate(-2px,-2px)';el.style.boxShadow='6px 6px 0 #0a0a0a';}}
                          onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translate(0,0)';el.style.boxShadow='4px 4px 0 #0a0a0a';}}
                        >
                          <div style={{flex:1}}>
                            <div style={{fontSize:16,fontWeight:700,marginBottom:8,letterSpacing:'-0.3px'}}>{s.title}</div>
                            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                              {s.difficulty&&<div style={{background:dc,border:'2px solid #0a0a0a',padding:'2px 10px',fontFamily:'Space Mono,monospace',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.difficulty}</div>}
                              <span style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#777'}}>{s.content?.questions?.length??0} QUESTIONS</span>
                            </div>
                          </div>
                          <div style={{fontFamily:'Space Mono,monospace',fontSize:20,fontWeight:700,color:'#ccc'}}>→</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ):(
                <div style={{textAlign:'center',padding:'60px 0'}}>
                  <div style={{fontFamily:'Space Mono,monospace',fontSize:48,fontWeight:700,color:'#eee',marginBottom:14}}>?</div>
                  <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>No practice sets yet</div>
                  <p style={{color:'#777',fontSize:14,marginBottom:20}}>Questions haven't been uploaded for this chapter.</p>
                  {error&&<p style={{fontFamily:'Space Mono,monospace',fontSize:12,color:'#ff4d4d',marginBottom:16}}>{error}</p>}
                  <button onClick={()=>window.history.back()} className="neu-btn-outline neu-btn" style={{fontSize:13}}>← Go back</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
