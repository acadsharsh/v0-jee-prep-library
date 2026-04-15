'use client';
import { useState, useEffect, useRef } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';
import { MathText } from './math-renderer';

interface QuestionResult { questionId: string; questionText: string; type: string; correct: boolean; userAnswer: any; correctAnswer: any; explanation?: string; timeSpent: number; }
interface Props { quiz: QuizJSON; quizId: string; onSubmit: (answers: { [k: string]: any }, timeTaken: number, score: number, questionResults: QuestionResult[]) => Promise<void>; }

function getType(q: QuizQuestion): QuestionType { if (q.type) return q.type; if (q.correctOptionIds) return 'msq'; if (q.correctAnswer !== undefined) return 'numerical'; return 'mcq'; }

export function QuizInterface({ quiz, onSubmit }: Props) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{ [k: string]: any }>({});
  const [revealed, setRevealed] = useState<{ [k: string]: boolean }>({});
  const [numInput, setNumInput] = useState<{ [k: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 2 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [start] = useState(Date.now());
  const qStart = useRef<number>(Date.now());
  const timePerQ = useRef<{ [k: string]: number }>({});

  useEffect(() => { const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { qStart.current = Date.now(); }, [cur]);

  const q = quiz.questions[cur];
  const qType = getType(q);
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const isLow = timeLeft < 300;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  const buildResults = () => quiz.questions.map(question => {
    const t = getType(question); const a = answers[question.id];
    let correct = false; let correctAnswer: any = '';
    if (t === 'mcq') { correct = a === question.correctOptionId; correctAnswer = question.options?.find(o => o.id === question.correctOptionId)?.text ?? question.correctOptionId; }
    else if (t === 'msq') { const cs = new Set(question.correctOptionIds ?? []); const as_ = new Set(Array.isArray(a) ? a : []); correct = cs.size === as_.size && [...cs].every(x => as_.has(x)); correctAnswer = [...cs].join(','); }
    else if (t === 'numerical') { const n = parseFloat(a); correct = !isNaN(n) && Math.abs(n - (question.correctAnswer ?? 0)) <= (question.tolerance ?? 0); correctAnswer = question.correctAnswer; }
    return { questionId: question.id, questionText: question.questionText, type: t, correct, userAnswer: a, correctAnswer, explanation: question.explanation, timeSpent: timePerQ.current[question.id] ?? 0 };
  });

  const calcScore = () => { const r = buildResults(); return Math.round((r.filter(x => x.correct).length / r.length) * 100); };
  const recordTime = () => { timePerQ.current[q.id] = Math.round((Date.now() - qStart.current) / 1000); };

  const selectMCQ = (id: string) => { if (isRev) return; setAnswers(p => ({ ...p, [q.id]: id })); };
  const toggleMSQ = (id: string) => { if (isRev) return; const c = (answers[q.id] as string[]) ?? []; setAnswers(p => ({ ...p, [q.id]: c.includes(id) ? c.filter(x => x !== id) : [...c, id] })); };
  const canCheck = qType === 'numerical' ? !!(numInput[q.id]?.trim()) : qType === 'msq' ? !!(sel && (sel as string[]).length > 0) : !!sel;
  const check = () => { recordTime(); if (qType === 'numerical') setAnswers(p => ({ ...p, [q.id]: numInput[q.id] ?? '' })); if (!canCheck) return; setRevealed(p => ({ ...p, [q.id]: true })); };
  const next = () => { if (cur < quiz.questions.length - 1) setCur(p => p + 1); };
  const prev = () => { if (cur > 0) setCur(p => p - 1); };
  const finish = async () => { recordTime(); setSubmitting(true); await onSubmit(answers, Math.floor((Date.now() - start) / 1000), calcScore(), buildResults()); setSubmitting(false); };

  const mcqCls = (id: string) => { const isSel = sel === id; const isC = id === q.correctOptionId; if (!isRev) return isSel ? 'sel' : ''; if (isC) return 'correct'; if (isSel) return 'wrong'; return 'dim'; };
  const msqCls = (id: string) => { const s = (sel as string[]) ?? []; const isSel = s.includes(id); const isC = (q.correctOptionIds ?? []).includes(id); if (!isRev) return isSel ? 'sel' : ''; if (isC) return 'correct'; if (isSel) return 'wrong'; return 'dim'; };
  const numOk = () => { const n = parseFloat(answers[q.id]); return !isNaN(n) && Math.abs(n - (q.correctAnswer ?? 0)) <= (q.tolerance ?? 0); };

  const answered = Object.keys(answers).filter(k => { const v = answers[k]; return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0); }).length;

  const bubCls = (idx: number) => {
    const bq = quiz.questions[idx]; if (idx === cur) return 'current';
    const hasA = answers[bq.id] !== undefined && answers[bq.id] !== '';
    if (hasA && revealed[bq.id]) {
      const t = getType(bq); let ok = false;
      if (t === 'mcq') ok = answers[bq.id] === bq.correctOptionId;
      else if (t === 'msq') { const cs = new Set(bq.correctOptionIds ?? []); const as_ = new Set(answers[bq.id] as string[]); ok = cs.size === as_.size && [...cs].every(x => as_.has(x)); }
      else { const n = parseFloat(answers[bq.id]); ok = !isNaN(n) && Math.abs(n - (bq.correctAnswer ?? 0)) <= (bq.tolerance ?? 0); }
      return ok ? 'correct' : 'wrong';
    }
    return hasA ? 'answered' : '';
  };

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.quiz_title}</div>
        <div className={`timer-chip${isLow ? ' low' : ''}`}>⏱ {fmt(timeLeft)}</div>
      </div>
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${((cur + 1) / quiz.questions.length) * 100}%` }} />
      </div>

      <div className="quiz-body">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span className="qnum-label">Q {cur + 1} <span style={{ color: 'var(--faint)' }}>/ {quiz.questions.length}</span></span>
          <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
          <span className="badge badge-muted" style={{ fontSize: 10 }}>{qType.toUpperCase()}</span>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>{answered}/{quiz.questions.length} answered</span>
        </div>

        {/* Question */}
        <div style={{ marginBottom: 28 }}>
          {qType === 'msq' && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lime)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✦ Select all correct answers</div>}
          <div className="q-text"><MathText>{q.questionText}</MathText></div>
          {q.imageUrl && (
            <div style={{ marginTop: 16, background: '#fff', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', display: 'inline-block', maxWidth: '100%' }}>
              <img src={q.imageUrl} alt={q.imageCaption ?? 'Question diagram'} style={{ maxWidth: '100%', maxHeight: 320, display: 'block', objectFit: 'contain' }} />
              {q.imageCaption && <div style={{ padding: '6px 12px', fontSize: 11, color: '#666', textAlign: 'center', fontStyle: 'italic' }}>{q.imageCaption}</div>}
            </div>
          )}
        </div>

        {/* MCQ */}
        {qType === 'mcq' && q.options && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {q.options.map((opt, i) => {
              const cls = mcqCls(opt.id); const isSel = sel === opt.id; const isC = opt.id === q.correctOptionId;
              return (
                <div key={opt.id} className={`opt ${cls ? 'locked ' + cls : ''}`} onClick={() => selectMCQ(opt.id)} style={{ cursor: isRev ? 'default' : 'pointer' }}>
                  <div className="opt-letter">{LETTERS[i]}</div>
                  <div className="opt-text"><MathText>{opt.text}</MathText></div>
                  {isRev && isC && <span style={{ fontSize: 12, color: 'var(--lime)', flexShrink: 0 }}>✓</span>}
                  {isRev && isSel && !isC && <span style={{ fontSize: 12, color: 'var(--coral)', flexShrink: 0 }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MSQ */}
        {qType === 'msq' && q.options && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {q.options.map((opt, i) => {
              const cls = msqCls(opt.id); const selArr = (sel as string[]) ?? []; const isSel = selArr.includes(opt.id); const isC = (q.correctOptionIds ?? []).includes(opt.id);
              return (
                <div key={opt.id} className={`opt ${cls ? 'locked ' + cls : ''}`} onClick={() => toggleMSQ(opt.id)} style={{ cursor: isRev ? 'default' : 'pointer' }}>
                  <div className="opt-letter" style={{ borderRadius: 4, background: isSel && !isRev ? 'var(--yellow)' : undefined, borderColor: isSel && !isRev ? 'var(--yellow)' : undefined, color: isSel && !isRev ? '#0a0a0a' : undefined }}>{isSel ? '✓' : LETTERS[i]}</div>
                  <div className="opt-text"><MathText>{opt.text}</MathText></div>
                  {isRev && isC && <span style={{ fontSize: 12, color: 'var(--lime)', flexShrink: 0 }}>✓</span>}
                  {isRev && isSel && !isC && <span style={{ fontSize: 12, color: 'var(--coral)', flexShrink: 0 }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Numerical */}
        {qType === 'numerical' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Enter answer{q.tolerance ? ` (±${q.tolerance} accepted)` : ''}
            </div>
            <input type="number" step="any" placeholder="0" value={numInput[q.id] ?? ''} disabled={isRev}
              onChange={e => { setNumInput(p => ({ ...p, [q.id]: e.target.value })); if (!isRev) setAnswers(p => ({ ...p, [q.id]: e.target.value })); }}
              style={{ width: 200, fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, padding: '12px 16px', background: 'var(--surface2)', border: `2px solid ${isRev ? (numOk() ? 'var(--lime)' : 'var(--coral)') : 'var(--yellow)'}`, borderRadius: 'var(--r-md)', color: isRev ? (numOk() ? 'var(--lime)' : 'var(--coral)') : 'var(--text)', outline: 'none' }}
            />
            {isRev && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>Correct: <span style={{ color: 'var(--lime)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{q.correctAnswer}</span>{q.tolerance && <span style={{ color: 'var(--faint)' }}> ±{q.tolerance}</span>}</div>}
          </div>
        )}

        {/* Explanation */}
        {isRev && (q.explanation || q.explanationImageUrl) && (
          <div className="solution-box fade-up" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginBottom: 8 }}>Solution</div>
            {q.explanation && <MathText style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--muted)' }}>{q.explanation}</MathText>}
            {q.explanationImageUrl && (
              <div style={{ marginTop: 10, background: '#fff', borderRadius: 8, overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
                <img src={q.explanationImageUrl} alt="Explanation diagram" style={{ maxWidth: '100%', maxHeight: 280, display: 'block', objectFit: 'contain' }} />
              </div>
            )}
          </div>
        )}

        {/* Q nav bubbles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {quiz.questions.map((_, idx) => (
            <button key={idx} onClick={() => setCur(idx)} className={`q-bubble ${bubCls(idx)}`}>{idx + 1}</button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="quiz-bottom">
        <button onClick={prev} disabled={cur === 0} className="btn-ghost" style={{ opacity: cur === 0 ? 0.3 : 1, fontSize: 13 }}>← Prev</button>
        {!isRev ? (
          <button onClick={check} disabled={!canCheck} className="btn-primary" style={{ flex: 1, maxWidth: 320, justifyContent: 'center', fontSize: 14, opacity: !canCheck ? 0.4 : 1 }}>Check Answer</button>
        ) : (
          <button onClick={cur < quiz.questions.length - 1 ? next : finish} disabled={submitting} className="btn-primary" style={{ flex: 1, maxWidth: 320, justifyContent: 'center', fontSize: 14, background: cur < quiz.questions.length - 1 ? 'var(--yellow)' : 'var(--lime)' }}>
            {cur < quiz.questions.length - 1 ? 'Next →' : submitting ? 'Saving…' : 'Finish ✓'}
          </button>
        )}
        <button onClick={cur < quiz.questions.length - 1 ? next : finish} className="btn-ghost" style={{ fontSize: 13 }}>
          {cur < quiz.questions.length - 1 ? 'Skip →' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
