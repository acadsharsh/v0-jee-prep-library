'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizJSON } from '@/lib/types';
import { ChevronLeft, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface QuizData {
  id: string;
  content: QuizJSON;
}

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const chapRes = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await chapRes.json();

        let chapterId: string | null = null;
        let title = '';
        for (const classChapters of Object.values(chapters)) {
          const found = (classChapters as any[]).find(ch => ch.slug === chapterSlug);
          if (found) { chapterId = found.id; title = found.title; break; }
        }

        if (!chapterId) throw new Error('Chapter not found');
        setChapterTitle(title);

        const quizRes = await fetch(`/api/quizzes/${chapterId}`);
        if (!quizRes.ok) {
          const e = await quizRes.json();
          throw new Error(e.error || 'Failed to fetch quiz');
        }
        const quizData = await quizRes.json();
        setQuiz({ id: quizData.id, content: quizData.content });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [bookSlug, chapterSlug]);

  const handleQuizSubmit = async (answers: { [key: string]: string }, timeTaken: number) => {
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
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>

          {/* Back */}
          <Link href={`/books/${bookSlug}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#8b92a5',
            textDecoration: 'none', marginBottom: 32,
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <ChevronLeft size={14} /> Back to chapters
          </Link>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.06)',
                borderTopColor: '#4f8ef7',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#8b92a5', fontSize: 14 }}>Loading quiz…</p>
            </div>
          ) : quiz ? (
            <div className="animate-fade-up">
              <QuizInterface quiz={quiz.content} quizId={quiz.id} onSubmit={handleQuizSubmit} />
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'var(--bg-surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <AlertCircle size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#f0f2f7', marginBottom: 10 }}>
                No quiz yet
              </h3>
              <p style={{ color: '#8b92a5', fontSize: 14, marginBottom: 8 }}>
                This chapter doesn't have a quiz uploaded yet.
              </p>
              {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 20 }}>{error}</p>}
              <Link href={`/books/${bookSlug}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#f0f2f7', fontSize: 13, fontWeight: 700,
                textDecoration: 'none', fontFamily: 'Syne, sans-serif',
              }}>
                <BookOpen size={14} /> Other chapters
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
