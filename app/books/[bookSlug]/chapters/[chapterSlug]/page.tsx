'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizJSON } from '@/lib/types';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface QuizData { id: string; content: QuizJSON; }

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const chapRes = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await chapRes.json();
        let chapterId: string | null = null;
        for (const arr of Object.values(chapters)) {
          const found = (arr as any[]).find(ch => ch.slug === chapterSlug);
          if (found) { chapterId = found.id; break; }
        }
        if (!chapterId) throw new Error('Chapter not found');
        const quizRes = await fetch(`/api/quizzes/${chapterId}`);
        if (!quizRes.ok) { const e = await quizRes.json(); throw new Error(e.error || 'Failed to fetch quiz'); }
        const q = await quizRes.json();
        setQuiz({ id: q.id, content: q.content });
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers: { [key: string]: string }, timeTaken: number) => {
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz?.id, answers, timeTaken }),
      });
      router.push(`/books/${bookSlug}`);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--bg-0)', minHeight: 'calc(100vh - 48px)' }}>

        {!quiz && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href={`/books/${bookSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--tx-3)' }}>
              <ChevronLeft size={13} /> Back to chapters
            </Link>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 96px)', color: 'var(--tx-3)', fontSize: 13 }}>
            Loading quiz…
          </div>
        ) : quiz ? (
          <QuizInterface quiz={quiz.content} quizId={quiz.id} onSubmit={handleSubmit} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 96px)' }}>
            <div style={{ textAlign: 'center', maxWidth: 340 }}>
              <AlertTriangle size={28} color="var(--acc)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx-1)', marginBottom: 6 }}>No quiz yet</div>
              <div style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 18 }}>
                This chapter doesn't have a quiz uploaded yet.
              </div>
              {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>{error}</div>}
              <Link href={`/books/${bookSlug}`} className="btn-ghost" style={{ fontSize: 12 }}>
                ← Other chapters
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
