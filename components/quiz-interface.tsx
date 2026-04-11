'use client';

import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';

interface QuizInterfaceProps {
  quiz: QuizJSON;
  quizId: string;
  onSubmit: (answers: { [key: string]: string }, timeTaken: number) => Promise<void>;
}

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.questions.length * 2 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTimeRemaining(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quiz.questions[currentQuestion];
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const isCorr = sel === q.correctOptionId;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([id, ans]) => quiz.questions.find(x => x.id === id)?.correctOptionId === ans
  ).length;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isLow = timeRemaining < 300;

  const handleSelect = (optId: string) => { if (isRev) return; setAnswers(p => ({ ...p, [q.id]: optId })); };
  const handleCheck = () => { if (!sel) return; setRevealed(p => ({ ...p, [q.id]: true })); };
  const handleNext = () => { if (currentQuestion < quiz.questions.length - 1) setCurrentQuestion(p => p + 1); };
  const handlePrev = () => { if (currentQuestion > 0) setCurrentQuestion(p => p - 1); };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(answers, Math.floor((Date.now() - startTime) / 1000));
    setIsSubmitting(false);
  };

  const optStyle = (optId: string) => {
    const isSel = sel === optId;
    const isC = optId === q.correctOptionId;
    if (!isRev) {
      if (isSel) return { border: '1px solid var(--acc)', background: 'var(--acc-dim)', color: 'var(--tx-1)' };
      return { border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--tx-2)' };
    }
    if (isC) return { border: '1px solid var(--green)', background: 'var(--green-dim)', color: 'var(--tx-1)' };
    if (isSel) return { border: '1px solid var(--red)', background: 'var(--red-dim)', color: 'var(--tx-1)' };
    return { border: '1px solid var(--border)', background: 'transparent', color: 'var(--tx-3)' };
  };

  const bubbleStyle = (idx: number) => {
    const bq = quiz.questions[idx];
    if (idx === currentQuestion) return { background: 'var(--acc)', color: '#fff', border: '1px solid var(--acc)' };
    if (answers[bq.id]) {
      if (!revealed[bq.id]) return { background: 'var(--bg-3)', color: 'var(--tx-2)', border: '1px solid var(--border-mid)' };
      return answers[bq.id] === bq.correctOptionId
        ? { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)' }
        : { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)' };
    }
    return { background: 'transparent', color: 'var(--tx-3)', border: '1px solid var(--border)' };
  };

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 'calc(100vh - 48px)' }}>

      {/* Left — question nav sidebar */}
      <div style={{
        width: 200, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-1)',
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Timer */}
        <div style={{
          textAlign: 'center',
          padding: '10px',
          borderRadius: 6,
          background: isLow ? 'var(--red-dim)' : 'var(--bg-2)',
          border: `1px solid ${isLow ? 'var(--red)' : 'var(--border)'}`,
          fontSize: 18, fontWeight: 700,
          color: isLow ? 'var(--red)' : 'var(--tx-1)',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
        }}>
          {fmt(timeRemaining)}
        </div>

        {/* Progress */}
        <div style={{ fontSize: 11.5, color: 'var(--tx-3)', textAlign: 'center' }}>
          {correctCount}/{answeredCount} correct
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--acc)', borderRadius: 2,
            width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Bubbles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              style={{
                width: 30, height: 30, borderRadius: 5,
                fontSize: 11.5, fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.12s',
                ...bubbleStyle(idx),
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
          {[
            { color: 'var(--acc)', label: 'Current' },
            { color: 'var(--green)', label: 'Correct' },
            { color: 'var(--red)', label: 'Wrong' },
            { color: 'var(--tx-3)', label: 'Unattempted' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--tx-3)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right — question area */}
      <div style={{ flex: 1, padding: '24px 32px', maxWidth: 740 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Q{currentQuestion + 1} / {quiz.questions.length}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-2)' }}>
            {quiz.quiz_title}
          </div>
        </div>

        {/* Question */}
        <div key={currentQuestion} className="fade-in">
          <p style={{
            fontSize: 15.5, lineHeight: 1.7, color: 'var(--tx-1)',
            fontWeight: 500, marginBottom: 22,
          }}>
            {q.questionText}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {q.options.map((opt, i) => {
              const s = optStyle(opt.id);
              const letters = ['A', 'B', 'C', 'D'];
              const isSel = sel === opt.id;
              const isC = opt.id === q.correctOptionId;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '11px 14px', borderRadius: 6,
                    cursor: isRev ? 'default' : 'pointer',
                    transition: 'all 0.12s',
                    ...s,
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: isSel || (isRev && isC) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    color: 'inherit',
                  }}>
                    {letters[i]}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, flex: 1 }}>{opt.text}</span>
                  {isRev && isC && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>✓ Correct</span>
                  )}
                  {isRev && isSel && !isC && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>✗ Wrong</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {isRev && q.explanation && (
            <div className="fade-in" style={{
              padding: '12px 16px', borderRadius: 6,
              background: 'var(--bg-2)',
              borderLeft: `3px solid ${isCorr ? 'var(--green)' : 'var(--red)'}`,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: isCorr ? 'var(--green)' : 'var(--red)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isCorr ? 'Correct' : 'Explanation'}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--tx-2)', margin: 0 }}>{q.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handlePrev} disabled={currentQuestion === 0} className="btn-ghost"
              style={{ opacity: currentQuestion === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={13} /> Prev
            </button>

            {!isRev ? (
              <button onClick={handleCheck} disabled={!sel} className="btn-acc"
                style={{ flex: 1, justifyContent: 'center', opacity: !sel ? 0.4 : 1 }}>
                Check answer
              </button>
            ) : currentQuestion < quiz.questions.length - 1 ? (
              <button onClick={handleNext} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Next <ChevronRight size={13} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="btn-acc"
                style={{ flex: 1, justifyContent: 'center', background: 'var(--green)', borderColor: 'var(--green)' }}>
                <Flag size={13} /> {isSubmitting ? 'Submitting…' : 'Finish quiz'}
              </button>
            )}

            <button onClick={handleNext} disabled={currentQuestion === quiz.questions.length - 1}
              className="btn-ghost" style={{ opacity: currentQuestion === quiz.questions.length - 1 ? 0.3 : 1 }}>
              Skip <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
