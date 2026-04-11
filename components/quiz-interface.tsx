'use client';

import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';

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
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
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

  const handleSelect = (optionId: string) => {
    if (isRevealed) return;
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setRevealed(prev => ({ ...prev, [question.id]: true }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setQuizDone(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      await onSubmit(answers, timeTaken);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!isRevealed) {
      return selectedAnswer === optionId
        ? 'option-selected'
        : 'option-default';
    }
    if (optionId === question.correctOptionId) return 'option-correct';
    if (optionId === selectedAnswer && selectedAnswer !== question.correctOptionId) return 'option-wrong';
    return 'option-dim';
  };

  const getQuestionBubbleStyle = (idx: number) => {
    const q = quiz.questions[idx];
    if (idx === currentQuestion) return 'bubble-current';
    if (answers[q.id]) {
      const rev = revealed[q.id];
      if (!rev) return 'bubble-answered';
      return answers[q.id] === q.correctOptionId ? 'bubble-correct' : 'bubble-wrong';
    }
    return 'bubble-default';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

        .quiz-wrap {
          font-family: 'DM Sans', sans-serif;
          max-width: 780px;
          margin: 0 auto;
          padding: 0 0 60px;
        }

        /* Header */
        .quiz-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }
        .quiz-title {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          font-weight: 400;
          color: var(--color-text-primary);
          line-height: 1.3;
          flex: 1;
        }
        .quiz-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }
        .timer {
          font-size: 15px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid;
          font-variant-numeric: tabular-nums;
          transition: all 0.3s;
        }
        .timer-normal {
          border-color: #B5D4F4;
          color: #185FA5;
          background: #E6F1FB;
        }
        .timer-low {
          border-color: #F09595;
          color: #A32D2D;
          background: #FCEBEB;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .score-pill {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        /* Progress bar */
        .progress-bar-wrap {
          height: 4px;
          background: var(--color-border-tertiary);
          border-radius: 99px;
          margin-bottom: 6px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #378ADD;
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .progress-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        /* Question card */
        .question-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 16px;
          padding: 28px 28px 24px;
          margin-bottom: 16px;
        }
        .q-number {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #378ADD;
          margin-bottom: 10px;
        }
        .q-text {
          font-size: 17px;
          line-height: 1.6;
          color: var(--color-text-primary);
          margin-bottom: 24px;
          font-weight: 400;
        }

        /* Options */
        .options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 15px;
        }
        .option-default {
          border-color: var(--color-border-tertiary);
          background: var(--color-background-primary);
          color: var(--color-text-primary);
        }
        .option-default:hover {
          border-color: #85B7EB;
          background: #E6F1FB;
        }
        .option-selected {
          border-color: #378ADD;
          background: #E6F1FB;
          color: #0C447C;
        }
        .option-correct {
          border-color: #639922;
          background: #EAF3DE;
          color: #3B6D11;
        }
        .option-wrong {
          border-color: #E24B4A;
          background: #FCEBEB;
          color: #A32D2D;
        }
        .option-dim {
          border-color: var(--color-border-tertiary);
          background: var(--color-background-secondary);
          color: var(--color-text-tertiary);
          cursor: default;
          opacity: 0.6;
        }
        .option-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        .option-dot-filled::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          display: block;
        }
        .option-label {
          flex: 1;
          line-height: 1.4;
        }
        .option-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .tag-correct { background: #C0DD97; color: #27500A; }
        .tag-wrong { background: #F7C1C1; color: #791F1F; }

        /* Explanation */
        .explanation {
          margin-top: 16px;
          padding: 14px 16px;
          background: var(--color-background-secondary);
          border-radius: 10px;
          border-left: 3px solid #639922;
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          animation: fadeIn 0.3s ease;
        }
        .explanation-wrong {
          border-left-color: #E24B4A;
        }
        .explanation-label {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 4px;
          font-size: 13px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Action buttons */
        .actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }
        .btn {
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn:active { transform: scale(0.97); }
        .btn-ghost {
          background: transparent;
          border-color: var(--color-border-secondary);
          color: var(--color-text-secondary);
        }
        .btn-ghost:hover { background: var(--color-background-secondary); }
        .btn-ghost:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-primary {
          background: #185FA5;
          border-color: #185FA5;
          color: white;
        }
        .btn-primary:hover { background: #0C447C; border-color: #0C447C; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-check {
          background: #378ADD;
          border-color: #378ADD;
          color: white;
          flex: 1;
          max-width: 180px;
        }
        .btn-check:hover { background: #185FA5; border-color: #185FA5; }
        .btn-check:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-next {
          background: var(--color-background-primary);
          border-color: var(--color-border-secondary);
          color: var(--color-text-primary);
        }
        .btn-next:hover { background: var(--color-background-secondary); }
        .btn-submit {
          background: #3B6D11;
          border-color: #3B6D11;
          color: white;
        }
        .btn-submit:hover { background: #27500A; }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Question bubbles */
        .bubbles-scroll {
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .bubbles {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .bubble {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1.5px solid;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bubble-default { border-color: var(--color-border-tertiary); color: var(--color-text-secondary); background: transparent; }
        .bubble-default:hover { border-color: var(--color-border-secondary); background: var(--color-background-secondary); }
        .bubble-current { border-color: #378ADD; background: #E6F1FB; color: #185FA5; }
        .bubble-answered { border-color: #85B7EB; background: #E6F1FB; color: #185FA5; }
        .bubble-correct { border-color: #97C459; background: #EAF3DE; color: #3B6D11; }
        .bubble-wrong { border-color: #F09595; background: #FCEBEB; color: #A32D2D; }

        /* Legend */
        .legend {
          display: flex;
          gap: 14px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }
      `}</style>

      <div className="quiz-wrap">
        {/* Header */}
        <div className="quiz-header">
          <h1 className="quiz-title">{quiz.quiz_title}</h1>
          <div className="quiz-meta">
            <span className={`timer ${isLowTime ? 'timer-low' : 'timer-normal'}`}>
              {formatTime(timeRemaining)}
            </span>
            <span className="score-pill">
              {correctCount}/{answeredCount} correct
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        <p className="progress-label">
          Question {currentQuestion + 1} of {quiz.questions.length}
          {answeredCount > 0 && ` · ${answeredCount} answered`}
        </p>

        {/* Question card */}
        <div className="question-card">
          <div className="q-number">Q{currentQuestion + 1}</div>
          <p className="q-text">{question.questionText}</p>

          <div className="options">
            {question.options.map((option) => {
              const style = getOptionStyle(option.id);
              const isSel = selectedAnswer === option.id;
              const isCorr = option.id === question.correctOptionId;
              return (
                <div
                  key={option.id}
                  className={`option ${style}`}
                  onClick={() => handleSelect(option.id)}
                >
                  <span className={`option-dot ${isSel || (isRevealed && isCorr) ? 'option-dot-filled' : ''}`} />
                  <span className="option-label">{option.text}</span>
                  {isRevealed && isCorr && (
                    <span className="option-tag tag-correct">Correct</span>
                  )}
                  {isRevealed && isSel && !isCorr && (
                    <span className="option-tag tag-wrong">Wrong</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation after reveal */}
          {isRevealed && question.explanation && (
            <div className={`explanation ${!isCorrect ? 'explanation-wrong' : ''}`}>
              <div className="explanation-label">
                {isCorrect ? 'Correct!' : 'Not quite —'} here&apos;s why:
              </div>
              {question.explanation}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="actions">
          <button
            className="btn btn-ghost"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            ← Prev
          </button>

          <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {!isRevealed ? (
              <button
                className="btn btn-check"
                onClick={handleCheck}
                disabled={!selectedAnswer}
              >
                Check Answer
              </button>
            ) : (
              currentQuestion < quiz.questions.length - 1 ? (
                <button className="btn btn-next" onClick={handleNext}>
                  Next Question →
                </button>
              ) : (
                <button
                  className="btn btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Finish Quiz'}
                </button>
              )
            )}
          </div>

          <button
            className="btn btn-ghost"
            onClick={handleNext}
            disabled={currentQuestion === quiz.questions.length - 1}
          >
            Skip →
          </button>
        </div>

        {/* Question bubbles */}
        <div className="bubbles-scroll">
          <div className="bubbles">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                className={`bubble ${getQuestionBubbleStyle(idx)}`}
                onClick={() => setCurrentQuestion(idx)}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#E6F1FB', border: '1px solid #85B7EB' }} />
              Answered
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#EAF3DE', border: '1px solid #97C459' }} />
              Correct
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#FCEBEB', border: '1px solid #F09595' }} />
              Wrong
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'transparent', border: '1px solid #ccc' }} />
              Not visited
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
