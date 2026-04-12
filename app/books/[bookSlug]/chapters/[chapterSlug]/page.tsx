'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizJSON } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface QuizData { id: string; content: QuizJSON; title: string; difficulty: string | null; description: string | null; }

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'var(--lime)', medium: 'var(--yellow)', hard: '#ff4444',
  objective: 'var(--lime)', subjective: 'var(--mint)', numerical: 'var(--yellow)',
};

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cr = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await cr.json();
        let chapterId: string | null = null;
        for (const arr of Object.values(chapters)) {
          const found = (arr as any[]).find(ch => ch.slug === chapterSlug);
          if (found) { chapterId = found.id; break; }
        }
        if (!chapterId) throw new Error('Chapter not found');

        const qr = await fetch(`/api/quizzes/${chapterId}`);
        if (!qr.ok) { const e = await qr.json(); throw new Error(e.error || 'No quizzes found'); }
        const data = await qr.json();
        // API now returns array
        const arr = Array.isArray(data) ? data : [data];
        setQuizzes(arr);
        // If only one quiz, auto-select it
        if (arr.length === 1) setActiveQuiz(arr[0]);
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers: { [k: string]: string | string[] | number }, timeTaken: number, score: number) => {
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: activeQuiz?.id, score, timeTakenSeconds: timeTaken }),
      });
      setActiveQuiz(null); // go back to quiz picker
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--black)', minHeight: 'calc(100vh - 52px)' }}>

        {/* Breadcrumb */}
        <div style={{ padding: '14px 32px', borderBottom: '1.5px solid var(--dim)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/books/${bookSlug}`} style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>← Chapters</Link>
          {activeQuiz && (
            <>
              <span style={{ color: 'var(--dim)' }}>/</span>
              <button onClick={() => setActiveQuiz(null)} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {chapterSlug.replace(/-/g, ' ').toUpperCase()}
              </button>
              <span style={{ color: 'var(--dim)' }}>/</span>
              <span style={{ fontSize: 12, color: 'var(--lime)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{activeQuiz.title}</span>
            </>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)', fontFamily: 'Space Mono, monospace', color: 'var(--muted)', fontSize: 13 }}>
            LOADING...
          </div>
        ) : activeQuiz ? (
          <QuizInterface quiz={activeQuiz.content} quizId={activeQuiz.id} onSubmit={handleSubmit} />
        ) : quizzes.length > 0 ? (
          // Quiz picker — shown when chapter has multiple quizzes
          <div style={{ padding: '40px' }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>
                Select quiz
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: '-0.3px' }}>
                {chapterSlug.split('-').slice(1).join(' ').toUpperCase() || chapterSlug.toUpperCase()}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1.5px solid var(--dim)' }}>
                {quizzes.map((q, i) => {
                  const accent = DIFFICULTY_COLOR[q.difficulty?.toLowerCase() ?? ''] ?? 'var(--lime)';
                  const qCount = q.content?.questions?.length ?? 0;
                  return (
                    <div key={q.id} onClick={() => setActiveQuiz(q)} style={{
                      padding: '20px 24px',
                      borderBottom: i < quizzes.length - 1 ? '1.5px solid var(--dim)' : 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 16,
                      transition: 'background 0.1s',
                      position: 'relative',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--black-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    >
                      {/* Left accent bar */}
                      <div style={{ width: 3, height: 40, background: accent, flexShrink: 0 }} />

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{q.title}</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {q.difficulty && (
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent }}>
                              {q.difficulty}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Space Mono, monospace' }}>
                            {qCount} questions
                          </span>
                          {q.description && (
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{q.description}</span>
                          )}
                        </div>
                      </div>

                      <ArrowRight size={16} color="var(--muted)" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontFamily: 'Space Mono, monospace', color: 'var(--dim)' }}>?</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>NO QUIZ YET</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>This chapter doesn't have any questions uploaded.</div>
            {error && <div style={{ fontSize: 12, color: '#ff4444' }}>{error}</div>}
            <Link href={`/books/${bookSlug}`} className="btn-outline" style={{ fontSize: 12 }}>← Other chapters</Link>
          </div>
        )}
      </main>
    </>
  );
}
