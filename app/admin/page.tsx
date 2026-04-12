'use client';
import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{type:'success'|'error';message:string}|null>(null);
  const { toast } = useToast();

  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({quizJson:parsed}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed');
      setResult({type:'success',message:data.message||'Uploaded!'});
      setQuizJson('');
      toast({title:'Uploaded!',description:data.message});
    } catch(err:any) {
      setResult({type:'error',message:err.message});
      toast({title:'Error',description:err.message,variant:'destructive'});
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main className="dash-root" style={{minHeight:'calc(100vh - 64px)'}}>
        <div style={{background:'#FFFFFF',borderBottom:'1px solid #E8EAF0',padding:'18px 28px',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ShieldCheck size={20} color="#7C3AED"/>
          </div>
          <div>
            <div style={{fontFamily:'Lilita One, cursive',fontSize:20,color:'#1A1A2E'}}>Admin Panel</div>
            <div style={{fontSize:12,color:'#7C8DB0',fontWeight:700}}>Upload practice sets to the database</div>
          </div>
        </div>
        <div style={{padding:'28px',maxWidth:720}}>
          <div className="d-card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <span style={{fontFamily:'Lilita One, cursive',fontSize:18,color:'#1A1A2E'}}>Practice set JSON</span>
              {quizJson&&<span style={{padding:'4px 12px',borderRadius:100,fontSize:11,fontWeight:900,background:isValid()?'#D1FAE5':'#FEE2E2',color:isValid()?'#059669':'#EF4444'}}>{isValid()?'✓ Valid':'✗ Invalid'}</span>}
            </div>
            <div style={{position:'relative',marginBottom:14}}>
              <textarea value={quizJson} onChange={e=>setQuizJson(e.target.value)} rows={16} required
                placeholder={'{\n  "quiz_title": "HCV Ch1 — Objective",\n  "book_slug": "hcv",\n  ...\n}'}
                style={{fontFamily:'Space Mono, monospace',fontSize:12.5,lineHeight:1.7,resize:'vertical',borderColor:quizJson&&!isValid()?'#FCA5A5':'#E8EAF0'}}/>
              {quizJson&&<button onClick={()=>setQuizJson('')} style={{position:'absolute',top:10,right:10,background:'#F2F4F8',border:'1px solid #E8EAF0',borderRadius:8,color:'#7C8DB0',cursor:'pointer',padding:'4px 10px',fontSize:11,fontFamily:'Nunito,sans-serif',fontWeight:800,display:'flex',alignItems:'center',gap:4}}><Trash2 size={10}/>Clear</button>}
            </div>
            {result&&<div style={{padding:'11px 14px',borderRadius:12,marginBottom:14,background:result.type==='success'?'#D1FAE5':'#FEE2E2',color:result.type==='success'?'#059669':'#EF4444',fontSize:13,fontWeight:800,display:'flex',gap:8,alignItems:'center',fontFamily:'Nunito,sans-serif'}}>
              {result.type==='success'?<CheckCircle size={15}/>:<AlertCircle size={15}/>}{result.message}
            </div>}
            <button onClick={submit as any} disabled={loading||!quizJson||!isValid()} className="btn-dash-primary" style={{width:'100%',justifyContent:'center',opacity:loading||!quizJson?0.5:1,padding:'13px',fontSize:15}}>
              <Upload size={14}/>{loading?'Uploading…':'Upload practice set'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
