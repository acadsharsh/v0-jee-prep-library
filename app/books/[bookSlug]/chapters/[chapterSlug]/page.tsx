'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizJSON } from '@/lib/types';
import Link from 'next/link';

interface QuizData { id:string; content:QuizJSON; }

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quiz, setQuiz] = useState<QuizData|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cr = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await cr.json();
        let chapterId:string|null = null;
        for (const arr of Object.values(chapters)) {
          const found = (arr as any[]).find(ch => ch.slug===chapterSlug);
          if (found) { chapterId=found.id; break; }
        }
        if (!chapterId) throw new Error('Chapter not found');
        const qr = await fetch(`/api/quizzes/${chapterId}`);
        if (!qr.ok) { const e=await qr.json(); throw new Error(e.error||'Failed'); }
        const q = await qr.json();
        setQuiz({ id:q.id, content:q.content });
      } catch(e:any) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers:{[k:string]:string}, timeTaken:number) => {
    try {
      await fetch('/api/quiz-attempts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ quizId:quiz?.id, answers, timeTaken }) });
      router.push(`/books/${bookSlug}`);
    } catch(e){console.error(e);}
  };

  return (
    <>
      <Navigation />
      <main style={{ background:'var(--black)', minHeight:'calc(100vh - 52px)' }}>
        {!quiz && (
          <div style={{ padding:'14px 32px', borderBottom:'1.5px solid var(--dim)' }}>
            <Link href={`/books/${bookSlug}`} style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>← Back to chapters</Link>
          </div>
        )}
        {isLoading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 100px)', fontFamily:'Space Mono, monospace', color:'var(--muted)', fontSize:13 }}>
            LOADING QUIZ...
          </div>
        ) : quiz ? (
          <QuizInterface quiz={quiz.content} quizId={quiz.id} onSubmit={handleSubmit} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'calc(100vh - 100px)', gap:16, textAlign:'center' }}>
            <div style={{ fontSize:40, fontFamily:'Space Mono, monospace', color:'var(--dim)' }}>?</div>
            <div style={{ fontSize:18, fontWeight:700 }}>NO QUIZ YET</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>This chapter doesn't have a quiz uploaded.</div>
            {error && <div style={{ fontSize:12, color:'#ff4444' }}>{error}</div>}
            <Link href={`/books/${bookSlug}`} className="btn-outline" style={{ fontSize:12 }}>← Other chapters</Link>
          </div>
        )}
      </main>
    </>
  );
}
