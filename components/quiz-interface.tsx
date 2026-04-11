'use client';

import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Lightbulb, Flag } from 'lucide-react';

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
  const [quizDone, setQuizDone] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (quizDone) return;
    const t = setInterval(() => {
      setTimeRemaining(p => { if (p <= 0) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [quizDone]);

  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const isRevealed = revealed[question.id];
  const isCorrect = selectedAnswer === question.correctOptionId;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qId, ans]) => quiz.questions.find(q => q.id === qId)?.correctOptionId === ans
  ).length;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isLowTime = timeRemaining < 300;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (isRevealed) return;
    setAnswers(p => ({ ...p, [question.id]: optionId }));
  };
  const handleCheck = () => { if (!selectedAnswer) return; setRevealed(p => ({ ...p, [question.id]: true })); };
  const handleNext = () => { if (currentQuestion < quiz.questions.length - 1) setCurrentQuestion(p => p + 1); };
  const handleSubmit = async () => {
    setIsSubmitting(true); setQuizDone(true);
    await onSubmit(answers, Math.floor((Date.now() - startTime) / 1000));
    setIsSubmitting(false);
  };

  const getBubbleStyle = (idx: number) => {
    const q = quiz.questions[idx];
    if (idx === currentQuestion) return { bg: 'rgba(79,142,247,0.2)', border: '#4f8ef7', color: '#4f8ef7' };
    if (answers[q.id]) {
      if (!revealed[q.id]) return { bg: 'rgba(79,142,247,0.08)', border: 'rgba(79,142,247,0.4)', color: '#4f8ef7' };
      return answers[q.id] === q.correctOptionId
        ? { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.5)', color: '#22c55e' }
        : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', color: '#ef4444' };
    }
    return { bg: 'transparent', border: 'rgba(255,255,255,0.08)', color: '#8b92a5' };
  };

  const getOptionStyle = (optionId: string) => {
    const isSel = selectedAnswer === optionId;
    const isCorr = optionId === question.correctOptionId;
    if (!isRevealed) {
      if (isSel) return { bg: 'rgba(79,142,247,0.12)', border: '#4f8ef7', color: '#f0f2f7', dot: '#4f8ef7' };
      return { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)', color: '#d0d4e0', dot: '#4a5168' };
    }
    if (isCorr) return { bg: 'rgba(34,197,94,0.1)', border: '#22c55e', color: '#f0f2f7', dot: '#22c55e' };
    if (isSel && !isCorr) return { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#f0f2f7', dot: '#ef4444' };
    return { bg: 'transparent', border: 'rgba(255,255,255,0.04)', color: '#4a5168', dot: '#4a5168' };
  };

  return (
    <div style={{ fontFamily: 'Syne, sans-serif', maxWidth: 800, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f0f2f7', margin: 0, letterSpacing: '-0.3px' }}>
            {quiz.quiz_title}
          </h1>
          <div style={{ fontSize: 12, color: '#8b92a5', marginTop: 4 }}>
            {currentQuestion + 1} / {quiz.questions.length} questions · {correctCount} correct
          </div>
        </div>
        <div style={{
          padding: '8px 16px', borderRadius: 30,
          border: `1.5px solid ${isLowTime ? '#ef4444' : 'rgba(79,142,247,0.4)'}`,
          background: isLowTime ? 'rgba(239,68,68,0.1)' : 'rgba(79,142,247,0.08)',
          color: isLowTime ? '#ef4444' : '#4f8ef7',
          fontSize: 15, fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          animation: isLowTime ? 'pulse-blink 1s infinite' : 'none',
        }}>
          {formatTime(timeRemaining)}
        </div>
        <style>{`@keyframes pulse-blink { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #4f8ef7, #8b5cf6)',
          transition: 'width 0.4s ease',
          boxShadow: '0 0 10px rgba(79,142,247,0.5)',
        }} />
      </div>

      {/* Question card */}
      <div className="animate-scale-in" key={currentQuestion} style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 28,
        marginBottom: 14,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#4f8ef7', marginBottom: 14,
        }}>
          Question {currentQuestion + 1}
        </div>
        <p style={{
          fontSize: 17, lineHeight: 1.65, color: '#f0f2f7',
          marginBottom: 28, fontWeight: 500,
        }}>
          {question.questionText}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt) => {
            const s = getOptionStyle(opt.id);
            const isSel = selectedAnswer === opt.id;
            const isCorr = opt.id === question.correctOptionId;
            return (
              <div key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px',
                  borderRadius: 11,
                  border: `1.5px solid ${s.border}`,
                  background: s.bg,
                  cursor: isRevealed ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  color: s.color,
                }}
              >
                {/* Indicator */}
                {isRevealed ? (
                  isCorr
                    ? <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                    : (isSel ? <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', flexShrink: 0, marginTop: 1 }} />)
                ) : (
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${s.dot}`,
                    background: isSel ? s.dot : 'transparent',
                    transition: 'all 0.15s',
                    boxShadow: isSel ? `0 0 8px ${s.dot}` : 'none',
                  }} />
                )}
                <span style={{ fontSize: 15, lineHeight: 1.5, flex: 1 }}>{opt.text}</span>
                {isRevealed && isCorr && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.2)', color: '#22c55e', flexShrink: 0 }}>
                    CORRECT
                  </span>
                )}
                {isRevealed && isSel && !isCorr && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', color: '#ef4444', flexShrink: 0 }}>
                    WRONG
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {isRevealed && question.explanation && (
          <div className="animate-fade-up" style={{
            marginTop: 18, padding: '14px 18px',
            borderRadius: 10,
            background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            borderLeft: `3px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Lightbulb size={13} color={isCorrect ? '#22c55e' : '#f59e0b'} />
              <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? '#22c55e' : '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {isCorrect ? 'Correct!' : 'Explanation'}
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#d0d4e0', margin: 0 }}>{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
          disabled={currentQuestion === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 9,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: currentQuestion === 0 ? '#4a5168' : '#8b92a5',
            fontSize: 13, fontWeight: 600,
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif',
          }}>
          <ChevronLeft size={14} /> Prev
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isRevealed ? (
            <button onClick={handleCheck} disabled={!selectedAnswer} style={{
              padding: '10px 24px', borderRadius: 9,
              background: selectedAnswer ? '#4f8ef7' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedAnswer ? '#4f8ef7' : 'rgba(255,255,255,0.06)'}`,
              color: selectedAnswer ? '#fff' : '#4a5168',
              fontSize: 13, fontWeight: 700,
              cursor: selectedAnswer ? 'pointer' : 'not-allowed',
              fontFamily: 'Syne, sans-serif',
              boxShadow: selectedAnswer ? '0 0 20px rgba(79,142,247,0.35)' : 'none',
              transition: 'all 0.15s',
            }}>
              Check answer
            </button>
          ) : currentQuestion < quiz.questions.length - 1 ? (
            <button onClick={handleNext} style={{
              padding: '10px 24px', borderRadius: 9,
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f0f2f7', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 9,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Syne, sans-serif',
              boxShadow: '0 0 20px rgba(34,197,94,0.35)',
            }}>
              <Flag size={13} />
              {isSubmitting ? 'Submitting…' : 'Finish quiz'}
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentQuestion === quiz.questions.length - 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 9,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: currentQuestion === quiz.questions.length - 1 ? '#4a5168' : '#8b92a5',
            fontSize: 13, fontWeight: 600,
            cursor: currentQuestion === quiz.questions.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif',
          }}>
          Skip <ChevronRight size={14} />
        </button>
      </div>

      {/* Question nav bubbles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {quiz.questions.map((q, idx) => {
          const bs = getBubbleStyle(idx);
          return (
            <button key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1.5px solid ${bs.border}`,
                background: bs.bg, color: bs.color,
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                transition: 'all 0.15s',
              }}>
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { color: '#4f8ef7', label: 'Current / Answered' },
          { color: '#22c55e', label: 'Correct' },
          { color: '#ef4444', label: 'Wrong' },
          { color: '#4a5168', label: 'Not visited' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b92a5' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, opacity: 0.7 }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
