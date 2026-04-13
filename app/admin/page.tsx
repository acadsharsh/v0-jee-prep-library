'use client';
import{useState}from'react';
import{Navigation}from'@/components/navigation';
import{useToast}from'@/hooks/use-toast';

export default function AdminPage(){
  const[quizJson,setQuizJson]=useState('');
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState<{type:'success'|'error';message:string}|null>(null);
  const{toast}=useToast();
  const isValid=()=>{try{JSON.parse(quizJson);return true;}catch{return false;}};

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setResult(null);
    try{const parsed=JSON.parse(quizJson);const res=await fetch('/api/admin/upload-quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quizJson:parsed})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Failed');setResult({type:'success',message:data.message||'Uploaded!'});setQuizJson('');toast({title:'Uploaded!',description:data.message});}
    catch(err:any){setResult({type:'error',message:err.message});toast({title:'Error',description:err.message,variant:'destructive'});}
    finally{setLoading(false);}
  };

  return(
    <div className="neo-shell">
      <Navigation/>
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:3,height:22,background:'#f5d90a'}}/>
            <span className="neo-topbar-title">Import Questions</span>
          </div>
        </div>
        <div style={{padding:'24px',maxWidth:800}}>
          <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#999',marginBottom:4}}>// ADMIN PANEL</div>
          <h2 style={{fontSize:22,fontWeight:700,letterSpacing:'-0.5px',marginBottom:4}}>Upload Practice Sets</h2>
          <p style={{fontSize:13,color:'#777',marginBottom:24}}>Paste the AI-generated quiz JSON below.</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'#fafafa',border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',padding:24}}>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                Paste JSON
                {quizJson&&<span style={{padding:'2px 8px',background:isValid()?'#b8f72b':'#ff4d4d',border:'2px solid #0a0a0a',fontSize:10,fontWeight:700,color:isValid()?'#0a0a0a':'#fff'}}>{isValid()?'VALID':'INVALID'}</span>}
              </div>
              <div style={{position:'relative'}}>
                <textarea value={quizJson} onChange={e=>setQuizJson(e.target.value)} rows={16}
                  style={{width:'100%',height:220,padding:12,border:`3px solid ${quizJson&&!isValid()?'#ff4d4d':'#0a0a0a'}`,background:'#fafafa',fontFamily:'Space Mono,monospace',fontSize:11,color:'#0a0a0a',resize:'vertical',outline:'none',lineHeight:1.6}}
                  placeholder={'{\n  "quiz_title": "HCV Ch1 Objective",\n  "book_slug": "hcv",\n  ...\n}'}
                />
              </div>
              {result&&<div style={{marginTop:10,padding:'10px 14px',background:result.type==='success'?'#b8f72b':'#ff4d4d',border:'3px solid #0a0a0a',color:result.type==='success'?'#0a0a0a':'#fff',fontSize:13,fontWeight:700}}>{result.message}</div>}
              <button onClick={submit as any} disabled={loading||!quizJson||!isValid()} className="neu-btn neu-btn-black" style={{marginTop:12,width:'100%',justifyContent:'center',padding:13,fontSize:14,opacity:loading||!quizJson?.5:1}}>
                {loading?'UPLOADING…':'IMPORT →'}
              </button>
            </div>

            <div style={{background:'#fafafa',border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',padding:24}}>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>JSON Format</div>
              <pre style={{background:'#111',color:'#f5d90a',padding:16,fontSize:11,lineHeight:1.7,overflow:'auto',fontFamily:'Space Mono,monospace',border:'3px solid #0a0a0a',maxHeight:260}}>
{`{
  "quiz_title": "HCV Ch1 — MCQ",
  "book_slug": "hcv",
  "book_title": "HC Verma",
  "class_identifier": "11",
  "chapter_number": 1,
  "chapter_title": "Rest and Motion",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "A body ...",
      "options": [
        {"id":"a","text":"Option A"},
        {"id":"b","text":"Option B"}
      ],
      "correctOptionId": "b",
      "explanation": "Because..."
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
