'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizResults } from '@/components/quiz-results';
import { QuizJSON } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface QuizData { id:string; content:QuizJSON; }

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quiz, setQuiz] = useState<QuizData|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const chaptersRes = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await chaptersRes.json();
        let chapterId: string|null = null;
        for (const classChapters of Object.values(chapters)) {
          const found = (classChapters as any[]).find(ch => ch.slug===chapterSlug);
          if (found) { chapterId = found.id; break; }
        }
        if (!chapterId) throw new Error('Chapter not found');
        const quizRes = await fetch(`/api/quizzes/${chapterId}`);
        if (!quizRes.ok) { const e = await quizRes.json(); throw new Error(e.error||'Quiz not found'); }
        const quizData = await quizRes.json();
        setQuiz({ id:quizData.id, content:quizData.content });
      } catch(err:any) {
        setError(err.message);
      } finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers:{ [key:string]:string }, timeTaken:number) => {
    if (!quiz) return;
    const correct = quiz.content.questions.filter(q => answers[q.id]===q.correctOptionId).length;
    const pct = Math.round((correct/quiz.content.questions.length)*100);
    try {
      await fetch('/api/quiz-attempts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ quizId:quiz.id, answers, timeTaken }) });
    } catch(e) { console.error(e); }
    setResult({ totalQuestions:quiz.content.questions.length, correctAnswers:correct, answers });
  };

  if (result && quiz) return (
    <>
      <Navigation />
      <QuizResults result={result} onRetry={() => setResult(null)} onHome={() => router.push(`/books/${bookSlug}`)} />
    </>
  );

  return (
    <>
      <Navigation />
      <main style={{ background:'#0d0d0d', minHeight:'calc(100vh - 58px)' }}>
        <div style={{ background:'#0d0d0d', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 28px', display:'flex', alignItems:'center', gap:10 }}>
          <Link href={`/books/${bookSlug}`} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>
            <ChevronLeft size={13}/> Back to chapters
          </Link>
        </div>
        <div style={{ padding:'28px' }}>
          {isLoading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.08)', borderTopColor:'#FFD23F', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading quiz…</p>
              </div>
            </div>
          ) : quiz ? (
            <QuizInterface quiz={quiz.content} quizId={quiz.id} onSubmit={handleSubmit} />
          ) : (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:16, fontWeight:600, marginBottom:6 }}>No quiz available for this chapter yet.</p>
              {error && <p style={{ color:'#FF5252', fontSize:12, marginBottom:16 }}>{error}</p>}
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginBottom:24 }}>Check back soon or try another chapter.</p>
              <Link href={`/books/${bookSlug}`} style={{ padding:'10px 22px', borderRadius:10, background:'#FFD23F', color:'#0d0d0d', fontSize:13, fontWeight:800, fontFamily:'Space Grotesk,sans-serif' }}>← Browse chapters</Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
