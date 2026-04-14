'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizResults } from '@/components/quiz-results';
import { QuizJSON } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface QuizData { id: string; content: QuizJSON; title: string; difficulty: string | null; chapterId?: string; bookId?: string; }

export default function ChapterPracticePage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const { user, session } = useAuth();

  const [sets, setSets] = useState<QuizData[]>([]);
  const [activeSet, setActiveSet] = useState<QuizData | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chapterIdRef = useRef<string | null>(null);
  const bookIdRef = useRef<string | null>(null);
  const ini = user?.email?.slice(0, 2).toUpperCase() ?? 'JE';

  useEffect(() => {
    (async () => {
      try {
        const [cr, br] = await Promise.all([
          fetch(`/api/books/${bookSlug}/chapters`),
          fetch('/api/books'),
        ]);
        const chapters = await cr.json();
        const books = await br.json();
        const book = books.find((b: any) => b.slug === bookSlug);
        if (book) bookIdRef.current = book.id;

        let chapterId: string | null = null;
        for (const arr of Object.values(chapters)) {
          const found = (arr as any[]).find(ch => ch.slug === chapterSlug);
          if (found) { chapterId = found.id; break; }
        }
        if (!chapterId) throw new Error('Chapter not found');
        chapterIdRef.current = chapterId;

        const qr = await fetch(`/api/quizzes/${chapterId}`);
        if (!qr.ok) throw new Error((await qr.json()).error || 'No sets found');
        const data = await qr.json();
        const arr = Array.isArray(data) ? data : [data];
        setSets(arr);
        if (arr.length === 1) setActiveSet(arr[0]);
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers: { [k: string]: any }, timeTaken: number, score: number, questionResults: any[]) => {
    if (!activeSet) return;

    // Save via API route using auth token
    if (session?.access_token) {
      try {
        const res = await fetch('/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            quizId: activeSet.id,
            score,
            timeTakenSeconds: timeTaken,
            questionResults,
            chapterId: chapterIdRef.current,
            bookId: bookIdRef.current,
          }),
        });
        if (!res.ok) console.error('Save error:', await res.json());
        else console.log('Saved successfully');
      } catch (e) { console.error('Save failed:', e); }
    }

    setResult({ score, totalQuestions: activeSet.content.questions.length, questionResults, timeTaken });
    setActiveSet(null);
  };

  const diffColor: Record<string, string> = { easy: '#b8f72b', medium: '#f5d90a', hard: '#ff4d4d', objective: '#f5d90a', numerical: '#ff7a00' };

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        {result ? (
          <QuizResults result={result} onRetry={() => { setResult(null); if (sets.length === 1) setActiveSet(sets[0]); }} onHome={() => setResult(null)} />
        ) : activeSet ? (
          <QuizInterface quiz={activeSet.content} quizId={activeSet.id} onSubmit={handleSubmit} />
        ) : (
          <>
            <div className="neo-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href={`/books/${bookSlug}`} style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>← Chapters</Link>
                <span style={{ color: '#ccc' }}>/</span>
                <span className="neo-topbar-title">{chapterSlug.split('-').slice(1).join(' ').toUpperCase() || 'PRACTICE'}</span>
              </div>
              <div style={{ padding: '6px 14px', background: '#0a0a0a', color: '#f5d90a', fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700 }}>{ini}</div>
            </div>
            <div style={{ padding: '24px' }}>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <div style={{ width: 36, height: 36, border: '4px solid #eee', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : sets.length > 0 ? (
                <div style={{ maxWidth: 600 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// SELECT PRACTICE SET</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sets.map(s => (
                      <div key={s.id} onClick={() => setActiveSet(s)}
                        style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.1s, box-shadow 0.1s' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translate(-2px,-2px)'; el.style.boxShadow = '6px 6px 0 #0a0a0a'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translate(0,0)'; el.style.boxShadow = '4px 4px 0 #0a0a0a'; }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {s.difficulty && <span style={{ background: diffColor[s.difficulty?.toLowerCase()] ?? '#f5d90a', border: '2px solid #0a0a0a', padding: '2px 10px', fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{s.difficulty}</span>}
                            <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#777' }}>{s.content?.questions?.length ?? 0} QUESTIONS</span>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 20, fontWeight: 700, color: '#ccc' }}>→</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 48, fontWeight: 700, color: '#eee', marginBottom: 14 }}>?</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No practice sets yet</div>
                  {error && <p style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#ff4d4d', marginBottom: 16 }}>{error}</p>}
                  <button onClick={() => window.history.back()} className="neu-btn-outline neu-btn">← Go back</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
