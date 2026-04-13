'use client';
import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{type:'success'|'error';message:string}|null>(null);
  const { toast } = useToast();
  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  const submit = async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setResult(null);
    try{const parsed=JSON.parse(quizJson);const res=await fetch('/api/admin/upload-quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quizJson:parsed})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Failed');setResult({type:'success',message:data.message||'Uploaded!'});setQuizJson('');toast({title:'Uploaded!',description:data.message});}
    catch(err:any){setResult({type:'error',message:err.message});toast({title:'Error',description:err.message,variant:'destructive'});}
    finally{setLoading(false);}
  };

  return (
    <div className="dbshell">
      <Navigation />
      <div className="sbmain">
        <div className="dbtop"><div className="tbtitle">Import Questions</div></div>
        <div className="sub active">
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:21,fontWeight:800,marginBottom:5}}>Import Questions</h2>
          <p style={{fontSize:13,color:'var(--mu)',marginBottom:20}}>Use AI to extract questions from any book PDF and paste the JSON here.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#fff',borderRadius:'var(--r)',border:'1.5px solid var(--bd)',padding:24}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,marginBottom:5}}>Paste JSON</div>
              <p style={{fontSize:12,color:'var(--mu)',marginBottom:18,lineHeight:1.6}}>Paste the AI-generated quiz JSON below.</p>
              <div style={{position:'relative'}}>
                <textarea value={quizJson} onChange={e=>setQuizJson(e.target.value)} rows={16} required
                  placeholder={'{\n  "quiz_title": "HCV Ch1 Objective",\n  "book_slug": "hcv",\n  ...\n}'}
                  style={{width:'100%',height:220,padding:12,border:`1.5px solid ${quizJson&&!isValid()?'var(--rd)':'var(--bd)'}`,borderRadius:'var(--rs)',fontFamily:'Courier New,monospace',fontSize:11,color:'var(--dk)',background:'var(--bg)',resize:'vertical',outline:'none',lineHeight:1.6,transition:'border .2s'}}
                />
                {quizJson&&<div style={{fontSize:11,fontWeight:700,marginTop:4,color:isValid()?'var(--gn)':'var(--rd)'}}>{isValid()?'✓ Valid JSON':'✗ Invalid JSON'}</div>}
              </div>
              {result&&<div style={{marginTop:10,padding:'10px 14px',borderRadius:10,background:result.type==='success'?'var(--gnl)':'var(--rdl)',color:result.type==='success'?'#166534':'var(--rd)',fontSize:13,fontWeight:600}}>{result.message}</div>}
              <button onClick={submit as any} disabled={loading||!quizJson||!isValid()} style={{marginTop:10,padding:'11px 24px',background:loading||!quizJson?'var(--mu)':'var(--dk)',color:'#fff',border:'none',borderRadius:'var(--rs)',fontSize:13,fontWeight:700,fontFamily:'Syne,sans-serif',cursor:loading||!quizJson?'not-allowed':'pointer',transition:'all .2s',opacity:loading||!quizJson?.6:1}}>
                {loading?'Uploading…':'Import Questions'}
              </button>
            </div>
            <div style={{background:'#fff',borderRadius:'var(--r)',border:'1.5px solid var(--bd)',padding:24}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,marginBottom:5}}>AI Extraction Prompt</div>
              <p style={{fontSize:12,color:'var(--mu)',marginBottom:18,lineHeight:1.6}}>Copy this, paste into ChatGPT/Claude/Gemini with your PDF chapter.</p>
              <div style={{background:'var(--bg)',border:'1.5px solid var(--bd)',borderRadius:'var(--rs)',padding:12,fontFamily:'Courier New,monospace',fontSize:11,color:'var(--dk)',lineHeight:1.6,whiteSpace:'pre-wrap',wordBreak:'break-all',maxHeight:220,overflowY:'auto',marginBottom:9}}>
{`{
  "quiz_title": "Book Chapter - Type",
  "book_slug": "hcv",
  "book_title": "HC Verma",
  "class_identifier": "11",
  "chapter_number": 1,
  "chapter_title": "Chapter Name",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "Question here?",
      "options": [
        {"id":"a","text":"Option A"},
        {"id":"b","text":"Option B"},
        {"id":"c","text":"Option C"},
        {"id":"d","text":"Option D"}
      ],
      "correctOptionId": "b",
      "explanation": "Because..."
    }
  ]
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
