'use client';
import { useState, useEffect, useRef } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';
import { MathText } from './math-renderer';

interface QuestionResult {
  questionId: string; questionText: string; type: string;
  correct: boolean; userAnswer: any; correctAnswer: any;
  explanation?: string; timeSpent: number;
}

interface Props {
  quiz: QuizJSON; quizId: string;
  onSubmit: (answers: { [k: string]: any }, timeTaken: number, score: number, questionResults: QuestionResult[]) => Promise<void>;
}

function getType(q: QuizQuestion): QuestionType {
  if (q.type) return q.type;
  if (q.correctOptionIds) return 'msq';
  if (q.correctAnswer !== undefined) return 'numerical';
  return 'mcq';
}

export function QuizInterface({ quiz, onSubmit }: Props) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{ [k: string]: any }>({});
  const [revealed, setRevealed] = useState<{ [k: string]: boolean }>({});
  const [numInput, setNumInput] = useState<{ [k: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 2 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [start] = useState(Date.now());
  const qStartTime = useRef<number>(Date.now());
  const timePerQ = useRef<{ [k: string]: number }>({});

  useEffect(() => { const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { qStartTime.current = Date.now(); }, [cur]);

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
    else if (t === 'numerical') { const num = parseFloat(a); correct = !isNaN(num) && Math.abs(num - (question.correctAnswer ?? 0)) <= (question.tolerance ?? 0); correctAnswer = question.correctAnswer; }
    return { questionId: question.id, questionText: question.questionText, type: t, correct, userAnswer: a, correctAnswer, explanation: question.explanation, timeSpent: timePerQ.current[question.id] ?? 0 };
  });

  const calcScore = () => { const r = buildResults(); return Math.round((r.filter(x => x.correct).length / r.length) * 100); };
  const recordQTime = () => { timePerQ.current[q.id] = Math.round((Date.now() - qStartTime.current) / 1000); };

  const selectMCQ = (id: string) => { if (isRev) return; setAnswers(p => ({ ...p, [q.id]: id })); };
  const toggleMSQ = (id: string) => { if (isRev) return; const c = (answers[q.id] as string[]) ?? []; setAnswers(p => ({ ...p, [q.id]: c.includes(id) ? c.filter(x => x !== id) : [...c, id] })); };
  const canCheck = qType === 'numerical' ? !!(numInput[q.id]?.trim()) : qType === 'msq' ? !!(sel && (sel as string[]).length > 0) : !!sel;

  const check = () => { recordQTime(); if (qType === 'numerical') setAnswers(p => ({ ...p, [q.id]: numInput[q.id] ?? '' })); if (!canCheck) return; setRevealed(p => ({ ...p, [q.id]: true })); };
  const next = () => { if (cur < quiz.questions.length - 1) setCur(p => p + 1); };
  const prev = () => { if (cur > 0) setCur(p => p - 1); };
  const finish = async () => { recordQTime(); setSubmitting(true); await onSubmit(answers, Math.floor((Date.now() - start) / 1000), calcScore(), buildResults()); setSubmitting(false); };

  const mcqCls = (optId: string) => { const isSel = sel === optId; const isC = optId === q.correctOptionId; if (!isRev) return isSel ? 'sel' : ''; if (isC) return 'correct'; if (isSel) return 'wrong'; return 'dim'; };
  const msqCls = (optId: string) => { const s = (sel as string[]) ?? []; const isSel = s.includes(optId); const isC = (q.correctOptionIds ?? []).includes(optId); if (!isRev) return isSel ? 'sel' : ''; if (isC) return 'correct'; if (isSel) return 'wrong'; return 'dim'; };
  const numOk = () => { const n = parseFloat(answers[q.id]); return !isNaN(n) && Math.abs(n - (q.correctAnswer ?? 0)) <= (q.tolerance ?? 0); };

  const answered = Object.keys(answers).filter(k => { const v = answers[k]; return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0); }).length;
  const pct = Math.round(((cur + 1) / quiz.questions.length) * 100);

  const bubCls = (idx: number) => {
    const bq = quiz.questions[idx]; const isCur = idx === cur;
    const hasA = answers[bq.id] !== undefined && answers[bq.id] !== '';
    if (isCur) return 'current';
    if (hasA && revealed[bq.id]) {
      const t = getType(bq); let ok = false;
      if (t === 'mcq') ok = answers[bq.id] === bq.correctOptionId;
      else if (t === 'msq') { const cs = new Set(bq.correctOptionIds ?? []); const as_ = new Set(answers[bq.id] as string[]); ok = cs.size === as_.size && [...cs].every(x => as_.has(x)); }
      else { const n = parseFloat(answers[bq.id]); ok = !isNaN(n) && Math.abs(n - (bq.correctAnswer ?? 0)) <= (bq.tolerance ?? 0); }
      return ok ? 'correct' : 'wrong';
    }
    if (hasA) return 'answered';
    return '';
  };

  return (
    <div className="neo-quiz-wrap">
      <div className="neo-quiz-top">
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#f5d90a', cursor: 'pointer', fontSize: 18, fontFamily: 'Space Mono,monospace', fontWeight: 700 }}>← BACK</button>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.quiz_title}</div>
        <div className={`neo-timer${isLow ? ' low' : ''}`}>{fmt(timeLeft)}</div>
      </div>

      <div className="neo-progress-wrap">
        <div className="neo-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="neo-quiz-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className="neo-qnum">Q {cur + 1} / {quiz.questions.length}</div>
          <div style={{ height: 2, flex: 1, background: '#333' }} />
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', padding: '3px 10px', border: '1.5px solid #333' }}>{qType.toUpperCase()}</span>
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#444' }}>{answered}/{quiz.questions.length} done</span>
        </div>

        {/* Question text with KaTeX */}
        <div style={{ marginBottom: 28 }}>
          {qType === 'msq' && (
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#0fd68a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              // MULTIPLE CORRECT — SELECT ALL THAT APPLY
            </div>
          )}
          <MathText style={{ fontSize: 17, lineHeight: 1.8, color: '#fff', fontWeight: 500 }}>
            {q.questionText}
          </MathText>
        </div>

        {/* MCQ */}
        {qType === 'mcq' && q.options && (
          <div className="neo-opt-grid" style={{ marginBottom: 24 }}>
            {q.options.map((opt, i) => {
              const cls = mcqCls(opt.id); const isSel = sel === opt.id; const isC = opt.id === q.correctOptionId;
              return (
                <div key={opt.id} className={`neo-dark-opt ${cls ? 'locked ' + cls : ''}`} onClick={() => selectMCQ(opt.id)} style={{ cursor: isRev ? 'default' : 'pointer', alignItems: 'flex-start' }}>
                  <div className="neo-dark-obub" style={{ marginTop: 2, flexShrink: 0 }}>{LETTERS[i]}</div>
                  <div style={{ flex: 1, fontSize: 14, lineHeight: 1.6 }}>
                    <MathText style={{ color: '#ddd' }}>{opt.text}</MathText>
                  </div>
                  {isRev && isC && <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#0fd68a', flexShrink: 0 }}>✓</span>}
                  {isRev && isSel && !isC && <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#ff4d4d', flexShrink: 0 }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MSQ */}
        {qType === 'msq' && q.options && (
          <div className="neo-opt-grid" style={{ marginBottom: 24 }}>
            {q.options.map((opt, i) => {
              const cls = msqCls(opt.id); const selArr = (sel as string[]) ?? []; const isSel = selArr.includes(opt.id); const isC = (q.correctOptionIds ?? []).includes(opt.id);
              return (
                <div key={opt.id} className={`neo-dark-opt ${cls ? 'locked ' + cls : ''}`} onClick={() => toggleMSQ(opt.id)} style={{ cursor: isRev ? 'default' : 'pointer', alignItems: 'flex-start' }}>
                  <div className="neo-dark-obub" style={{ borderRadius: 0, background: isSel ? '#f5d90a' : 'transparent', borderColor: isSel ? '#f5d90a' : '#555', color: isSel ? '#0a0a0a' : '#666', marginTop: 2, flexShrink: 0 }}>{isSel ? '✓' : LETTERS[i]}</div>
                  <div style={{ flex: 1, fontSize: 14, lineHeight: 1.6 }}>
                    <MathText style={{ color: '#ddd' }}>{opt.text}</MathText>
                  </div>
                  {isRev && isC && <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#0fd68a', flexShrink: 0 }}>✓</span>}
                  {isRev && isSel && !isC && <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#ff4d4d', flexShrink: 0 }}>✗</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Numerical */}
        {qType === 'numerical' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              // ENTER ANSWER{q.tolerance ? ` (±${q.tolerance})` : ''}
            </div>
            <input type="number" step="any" placeholder="0" value={numInput[q.id] ?? ''} disabled={isRev}
              onChange={e => { setNumInput(p => ({ ...p, [q.id]: e.target.value })); if (!isRev) setAnswers(p => ({ ...p, [q.id]: e.target.value })); }}
              style={{ width: 200, fontFamily: 'Space Mono,monospace', fontSize: 24, fontWeight: 700, padding: '12px 16px', background: '#1a1a1a', border: `3px solid ${isRev ? (numOk() ? '#0fd68a' : '#ff4d4d') : '#f5d90a'}`, color: isRev ? (numOk() ? '#0fd68a' : '#ff4d4d') : '#f5d90a', outline: 'none' }}
            />
            {isRev && (
              <div style={{ marginTop: 10, fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, color: '#666' }}>
                CORRECT: <span style={{ color: '#0fd68a' }}>{q.correctAnswer}</span>{q.tolerance && <span style={{ color: '#555' }}> ±{q.tolerance}</span>}
              </div>
            )}
          </div>
        )}

        {/* Explanation with KaTeX */}
        {isRev && q.explanation && (
          <div style={{ background: '#1a1800', border: '3px solid #f5d90a', padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f5d90a', marginBottom: 10 }}>// SOLUTION</div>
            <MathText style={{ fontSize: 14, lineHeight: 1.75, color: '#ccc' }}>{q.explanation}</MathText>
          </div>
        )}

        {/* Q nav bubbles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
          {quiz.questions.map((_, idx) => (
            <button key={idx} onClick={() => setCur(idx)} className={`neo-bubble ${bubCls(idx)}`}>{idx + 1}</button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="neo-quiz-bottom">
        <button onClick={prev} disabled={cur === 0} style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', color: cur === 0 ? '#333' : '#777', cursor: cur === 0 ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}>← Prev</button>
        {!isRev ? (
          <button onClick={check} disabled={!canCheck} style={{ flex: 1, maxWidth: 340, padding: 14, background: canCheck ? '#f5d90a' : '#1a1a1a', color: canCheck ? '#0a0a0a' : '#444', border: `3px solid ${canCheck ? '#f5d90a' : '#333'}`, fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, cursor: canCheck ? 'pointer' : 'not-allowed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CHECK ANSWER
          </button>
        ) : (
          <button onClick={cur < quiz.questions.length - 1 ? next : finish} disabled={submitting} style={{ flex: 1, maxWidth: 340, padding: 14, background: '#f5d90a', color: '#0a0a0a', border: '3px solid #f5d90a', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {cur < quiz.questions.length - 1 ? 'NEXT →' : submitting ? 'SAVING…' : 'FINISH ✓'}
          </button>
        )}
        <button onClick={cur < quiz.questions.length - 1 ? next : finish} style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, background: '#fff', color: '#0a0a0a', border: '3px solid #fff', padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase' }}>
          {cur < quiz.questions.length - 1 ? 'Skip →' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
