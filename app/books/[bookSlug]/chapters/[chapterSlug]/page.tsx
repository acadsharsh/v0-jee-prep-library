'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizResults } from '@/components/quiz-results';
import { QuizJSON } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, AlertTriangle } from 'lucide-react';

interface QuizData { id: string; content: QuizJSON; title: string; difficulty: string | null; description: string | null; }

const DIFF_CFG: Record<string, { bg: string; color: string }> = {
  easy:       { bg: '#d1fae5', color: '#059669' },
  medium:     { bg: '#fef9c3', color: '#ca8a04' },
  hard:       { bg: '#fee2e2', color: '#ef4444' },
  objective:  { bg: '#ede9fe', color: '#7b6cf6' },
  subjective: { bg: '#d1fae5', color: '#059669' },
  numerical:  { bg: '#fef9c3', color: '#ca8a04' },
};

export default function ChapterPracticePage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const { user } = useAuth();

  const [sets, setSets] = useState<QuizData[]>([]);
  const [activeSet, setActiveSet] = useState<QuizData | null>(null);
  const [result, setResult] = useState<{ correctAnswers: number; totalQuestions: number; answers: Record<string, string>; score: number } | null>(null);
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
        if (!qr.ok) { const e = await qr.json(); throw new Error(e.error || 'No practice sets found'); }
        const data = await qr.json();
        const arr = Array.isArray(data) ? data : [data];
        setSets(arr);
        if (arr.length === 1) setActiveSet(arr[0]);
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug, chapterSlug]);

  const handleSubmit = async (answers: { [k: string]: any }, timeTaken: number, score: number) => {
    // Calculate correct answers
    const correctAnswers = activeSet?.content.questions.filter(q => {
      const a = answers[q.id];
      if (!a) return false;
      if (!q.type || q.type === 'mcq') return a === q.correctOptionId;
      if (q.type === 'msq') {
        const cs = new Set(q.correctOptionIds ?? []);
        const as_ = new Set(Array.isArray(a) ? a : [a]);
        return cs.size === as_.size && [...cs].every(x => as_.has(x));
      }
      if (q.type === 'numerical') {
        const num = parseFloat(a);
        return !isNaN(num) && Math.abs(num - (q.correctAnswer ?? 0)) <= (q.tolerance ?? 0);
      }
      return false;
    }).length ?? 0;

    // Save attempt directly via supabase client (has session token automatically)
    if (user && activeSet) {
      const { error: saveError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: activeSet.id,
          score,
          time_taken_seconds: timeTaken,
        });
      if (saveError) console.error('Failed to save attempt:', saveError.message);
    }

    setResult({ correctAnswers, totalQuestions: activeSet?.content.questions.length ?? 0, answers: answers as Record<string, string>, score });
    setActiveSet(null);
  };

  const handleRetry = () => { setResult(null); if (sets.length === 1) setActiveSet(sets[0]); };
  const handleHome = () => { setResult(null); };

  return (
    <>
      <Navigation />
      <main style={{ background: '#f4f5fb', minHeight: 'calc(100vh - 64px)' }}>
        {/* Breadcrumb */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e8f0', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={`/books/${bookSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>
            <ChevronLeft size={14} /> Chapters
          </Link>
          {activeSet && (
            <>
              <span style={{ color: '#e8e8f0' }}>›</span>
              <button onClick={() => setActiveSet(null)} style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                {chapterSlug.split('-').slice(1).join(' ')}
              </button>
              <span style={{ color: '#e8e8f0' }}>›</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#7b6cf6' }}>{activeSet.title}</span>
            </>
          )}
        </div>

        {/* Result screen */}
        {result ? (
          <QuizResults result={result} onRetry={handleRetry} onHome={handleHome} />
        ) : isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e8e8f0', borderTopColor: '#7b6cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>Loading…</p>
            </div>
          </div>
        ) : activeSet ? (
          <QuizInterface quiz={activeSet.content} quizId={activeSet.id} onSubmit={handleSubmit} />
        ) : sets.length > 0 ? (
          /* Practice set picker */
          <div style={{ padding: '32px 28px' }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 8 }}>
                Select practice set
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 24, color: '#1e1e2d', marginBottom: 24 }}>
                {chapterSlug.split('-').slice(1).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sets.map((s) => {
                  const dc = DIFF_CFG[s.difficulty?.toLowerCase() ?? ''] ?? { bg: '#ede9fe', color: '#7b6cf6' };
                  return (
                    <div key={s.id} onClick={() => setActiveSet(s)} style={{
                      background: '#ffffff', borderRadius: 16, padding: '20px 24px',
                      border: '1px solid #e8e8f0', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 16,
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; el.style.borderColor = '#c4b5fd'; el.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e8e8f0'; el.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#1e1e2d', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>{s.title}</div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          {s.difficulty && (
                            <span style={{ padding: '3px 10px', borderRadius: 100, background: dc.bg, color: dc.color, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {s.difficulty}
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                            {s.content?.questions?.length ?? 0} questions
                          </span>
                          {s.description && <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.description}</span>}
                        </div>
                      </div>
                      <ArrowRight size={18} color="#9ca3af" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={28} color="#ca8a04" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1e1e2d', fontFamily: 'Space Grotesk, sans-serif' }}>No practice sets yet</div>
            <div style={{ fontSize: 14, color: '#9ca3af', fontWeight: 700 }}>Questions haven't been uploaded for this chapter.</div>
            {error && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{error}</div>}
            <Link href={`/books/${bookSlug}`} className="btn-ghost-d" style={{ fontSize: 13 }}><ChevronLeft size={14} /> Other chapters</Link>
          </div>
        )}
      </main>
    </>
  );
}
