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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ quizJson:parsed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed');
      setResult({ type:'success', message:data.message||'Uploaded!' });
      setQuizJson('');
      toast({ title:'Uploaded', description:data.message });
    } catch(err:any) {
      setResult({ type:'error', message:err.message });
      toast({ title:'Error', description:err.message, variant:'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ background:'var(--black)', minHeight:'calc(100vh - 52px)' }}>
        <div style={{ padding:'24px 40px 20px', borderBottom:'1.5px solid var(--dim)' }}>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.3px' }}>ADMIN — UPLOAD QUIZ</h1>
        </div>
        <div style={{ padding:'32px 40px', maxWidth:720 }}>
          <div style={{ border:'1.5px solid var(--dim)' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1.5px solid var(--dim)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Quiz JSON</span>
              {quizJson && (
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:isValid()?'var(--lime)':'#ff4444' }}>
                  {isValid() ? '✦ Valid' : '✗ Invalid JSON'}
                </span>
              )}
            </div>
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ position:'relative' }}>
                <textarea value={quizJson} onChange={e=>setQuizJson(e.target.value)} rows={16} required
                  placeholder={'{\n  "quiz_title": "...",\n  "book_slug": "hcv",\n  ...\n}'}
                  style={{ fontFamily:'Space Mono, monospace', fontSize:12, lineHeight:1.7, resize:'vertical', borderColor:quizJson&&!isValid()?'#ff4444':undefined }} />
                {quizJson && (
                  <button onClick={()=>setQuizJson('')} style={{
                    position:'absolute', top:10, right:10,
                    background:'var(--black-3)', border:'1.5px solid var(--dim)',
                    color:'var(--muted)', cursor:'pointer', padding:'3px 10px',
                    fontSize:11, fontFamily:'Space Grotesk, sans-serif', textTransform:'uppercase', letterSpacing:'0.05em',
                  }}>Clear</button>
                )}
              </div>
              {result && (
                <div style={{ padding:'10px 14px', border:`1.5px solid ${result.type==='success'?'var(--lime)':'#ff4444'}`, color:result.type==='success'?'var(--lime)':'#ff4444', fontSize:13 }}>
                  {result.type==='success'?'✦ ':''}{result.message}
                </div>
              )}
              <button onClick={submit as any} disabled={loading||!quizJson||!isValid()} className="btn-lime"
                style={{ justifyContent:'center', opacity:loading||!quizJson?0.4:1 }}>
                {loading ? 'Uploading…' : 'Upload quiz ✦'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
