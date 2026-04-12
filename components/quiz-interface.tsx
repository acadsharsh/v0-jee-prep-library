'use client';
import { useState, useEffect } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';
import { ChevronLeft, ChevronRight, Flag, Lightbulb } from 'lucide-react';

interface QuizInterfaceProps {
  quiz: QuizJSON;
  quizId: string;
  onSubmit: (answers: { [k: string]: any }, timeTaken: number, score: number) => Promise<void>;
}

function getType(q: QuizQuestion): QuestionType {
  if (q.type) return q.type;
  if (q.correctOptionIds) return 'msq';
  if (q.correctAnswer !== undefined) return 'numerical';
  return 'mcq';
}

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<{ [k: string]: any }>({});
  const [revealed, setRevealed] = useState<{ [k: string]: boolean }>({});
  const [numInput, setNumInput] = useState<{ [k: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 2 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [start] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quiz.questions[cur];
  const qType = getType(q);
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isLow = timeLeft < 300;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  const calcScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const t = getType(question); const ans = answers[question.id];
      if (t === 'mcq' && ans === question.correctOptionId) correct++;
      else if (t === 'msq' && Array.isArray(ans)) {
        const cs = new Set(question.correctOptionIds ?? []);
        const as_ = new Set(ans as string[]);
        if (cs.size === as_.size && [...cs].every(x => as_.has(x))) correct++;
      } else if (t === 'numerical') {
        const num = parseFloat(ans);
        if (!isNaN(num) && Math.abs(num - (question.correctAnswer ?? 0)) <= (question.tolerance ?? 0)) correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const selectMCQ = (optId: string) => { if (isRev) return; setAnswers(p => ({ ...p, [q.id]: optId })); };
  const toggleMSQ = (optId: string) => {
    if (isRev) return;
    const cur_ = (answers[q.id] as string[]) ?? [];
    setAnswers(p => ({ ...p, [q.id]: cur_.includes(optId) ? cur_.filter((x: string) => x !== optId) : [...cur_, optId] }));
  };

  const canCheck = qType === 'numerical' ? !!(numInput[q.id]?.trim())
    : qType === 'msq' ? !!(sel && (sel as string[]).length > 0) : !!sel;

  const check = () => {
    if (qType === 'numerical') setAnswers(p => ({ ...p, [q.id]: numInput[q.id] ?? '' }));
    if (!canCheck) return;
    setRevealed(p => ({ ...p, [q.id]: true }));
  };

  const next = () => { if (cur < quiz.questions.length - 1) setCur(p => p + 1); };
  const prev = () => { if (cur > 0) setCur(p => p - 1); };
  const finish = async () => {
    setSubmitting(true);
    await onSubmit(answers, Math.floor((Date.now() - start) / 1000), calcScore());
    setSubmitting(false);
  };

  const mcqStyle = (optId: string) => {
    const isSel = sel === optId; const isC = optId === q.correctOptionId;
    if (!isRev) return isSel ? 'opt-selected' : 'opt-default';
    if (isC) return 'opt-correct'; if (isSel) return 'opt-wrong'; return 'opt-dim';
  };
  const msqStyle = (optId: string) => {
    const selArr = (sel as string[]) ?? []; const isSel = selArr.includes(optId);
    const isC = (q.correctOptionIds ?? []).includes(optId);
    if (!isRev) return isSel ? 'opt-selected' : 'opt-default';
    if (isC) return 'opt-correct'; if (isSel) return 'opt-wrong'; return 'opt-dim';
  };
  const numCorrect = () => { const num = parseFloat(answers[q.id]); return !isNaN(num) && Math.abs(num - (q.correctAnswer ?? 0)) <= (q.tolerance ?? 0); };

  const bubbleStyle = (idx: number) => {
    const bq = quiz.questions[idx];
    if (idx === cur) return { bg: '#7b6cf6', color: '#fff', border: '#7b6cf6' };
    if (answers[bq.id] !== undefined && answers[bq.id] !== '') {
      if (!revealed[bq.id]) return { bg: '#ede9fe', color: '#7b6cf6', border: '#c4b5fd' };
      const t = getType(bq);
      let ok = false;
      if (t === 'mcq') ok = answers[bq.id] === bq.correctOptionId;
      else if (t === 'msq') { const cs = new Set(bq.correctOptionIds ?? []); const as_ = new Set(answers[bq.id] as string[]); ok = cs.size === as_.size && [...cs].every(x => as_.has(x)); }
      else { const num = parseFloat(answers[bq.id]); ok = !isNaN(num) && Math.abs(num - (bq.correctAnswer ?? 0)) <= (bq.tolerance ?? 0); }
      return ok ? { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' } : { bg: '#fee2e2', color: '#ef4444', border: '#fca5a5' };
    }
    return { bg: '#f4f5fb', color: '#9ca3af', border: '#e8e8f0' };
  };

  const answered = Object.keys(answers).filter(k => { const v = answers[k]; return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0); }).length;

  const typeCfg: Record<QuestionType, { label: string; bg: string; color: string }> = {
    mcq: { label: 'MCQ', bg: '#ede9fe', color: '#7b6cf6' },
    msq: { label: 'MSQ — multiple correct', bg: '#d1fae5', color: '#059669' },
    numerical: { label: 'Numerical', bg: '#fef9c3', color: '#ca8a04' },
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f4f5fb' }}>
      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e8e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Timer */}
        <div style={{
          padding: '16px', borderRadius: 14, textAlign: 'center',
          background: isLow ? '#fee2e2' : '#f4f5fb',
          border: `2px solid ${isLow ? '#fca5a5' : '#e8e8f0'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: isLow ? '#ef4444' : '#9ca3af', marginBottom: 4 }}>Time left</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: isLow ? '#ef4444' : '#1e1e2d' }}>{fmt(timeLeft)}</div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#7b6cf6' }}>{answered}/{quiz.questions.length}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: '#f4f5fb', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#7b6cf6', width: `${(answered / quiz.questions.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Bubbles */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 10 }}>Questions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {quiz.questions.map((_, idx) => {
              const bs = bubbleStyle(idx);
              return (
                <button key={idx} onClick={() => setCur(idx)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: bs.bg, color: bs.color,
                  border: `2px solid ${bs.border}`,
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.12s',
                }}>{idx + 1}</button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { bg: '#ede9fe', border: '#c4b5fd', color: '#7b6cf6', label: 'Current / Answered' },
            { bg: '#d1fae5', border: '#6ee7b7', color: '#059669', label: 'Correct' },
            { bg: '#fee2e2', border: '#fca5a5', color: '#ef4444', label: 'Wrong' },
            { bg: '#f4f5fb', border: '#e8e8f0', color: '#9ca3af', label: 'Not visited' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: l.bg, border: `1.5px solid ${l.border}`, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Question area */}
      <div style={{ flex: 1, padding: '32px 40px', maxWidth: 780, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 800, color: '#1e1e2d' }}>
              Q{cur + 1}
              <span style={{ color: '#9ca3af', fontWeight: 600 }}> / {quiz.questions.length}</span>
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 100, background: typeCfg[qType].bg, color: typeCfg[qType].color, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {typeCfg[qType].label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{quiz.quiz_title}</span>
        </div>

        <div key={cur} className="fade-up">
          <div className="d-card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#1e1e2d', fontWeight: 600, marginBottom: 24 }}>
              {q.questionText}
            </p>

            {/* MCQ */}
            {qType === 'mcq' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, i) => {
                  const isSel = sel === opt.id; const isC = opt.id === q.correctOptionId;
                  return (
                    <div key={opt.id} className={mcqStyle(opt.id)} onClick={() => selectMCQ(opt.id)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: isRev ? 'default' : 'pointer', transition: 'all 0.12s' }}>
                      <span style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '2px solid currentColor', flexShrink: 0, fontSize: 12, fontWeight: 800 }}>{letters[i]}</span>
                      <span style={{ flex: 1, fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>{opt.text}</span>
                      {isRev && isC && <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', flexShrink: 0 }}>✓ Correct</span>}
                      {isRev && isSel && !isC && <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>✗ Wrong</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MSQ */}
            {qType === 'msq' && q.options && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: '#d1fae5' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>✦ Select all correct answers</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, i) => {
                    const selArr = (sel as string[]) ?? []; const isSel = selArr.includes(opt.id);
                    const isC = (q.correctOptionIds ?? []).includes(opt.id);
                    return (
                      <div key={opt.id} className={msqStyle(opt.id)} onClick={() => toggleMSQ(opt.id)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: isRev ? 'default' : 'pointer', transition: 'all 0.12s' }}>
                        <span style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '2px solid currentColor', flexShrink: 0, fontSize: 12, fontWeight: 800, background: isSel ? 'currentColor' : 'transparent' }}>
                          {isSel && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                        </span>
                        <span style={{ flex: 1, fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>{opt.text}</span>
                        {isRev && isC && <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', flexShrink: 0 }}>✓ Correct</span>}
                        {isRev && isSel && !isC && <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>✗</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Numerical */}
            {qType === 'numerical' && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>
                  Enter your answer {q.tolerance ? `(±${q.tolerance} accepted)` : ''}
                </div>
                <input type="number" step="any" placeholder="0.00"
                  value={numInput[q.id] ?? ''} disabled={isRev}
                  onChange={e => { setNumInput(p => ({ ...p, [q.id]: e.target.value })); if (!isRev) setAnswers(p => ({ ...p, [q.id]: e.target.value })); }}
                  style={{ width: 220, fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, borderColor: isRev ? (numCorrect() ? '#10b981' : '#ef4444') : '#e8e8f0', color: isRev ? (numCorrect() ? '#059669' : '#ef4444') : '#1e1e2d' }}
                />
                {isRev && (
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>
                    Correct: <span style={{ color: '#059669' }}>{q.correctAnswer}</span>
                    {q.tolerance ? <span style={{ color: '#9ca3af' }}> ±{q.tolerance}</span> : ''}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explanation */}
          {isRev && q.explanation && (
            <div className="fade-up" style={{ display: 'flex', gap: 12, padding: '16px', borderRadius: 14, background: '#f4f5fb', border: '1px solid #e8e8f0', marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lightbulb size={16} color="#ca8a04" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#ca8a04', marginBottom: 4 }}>Explanation</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#374151', fontWeight: 600 }}>{q.explanation}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={prev} disabled={cur === 0} className="btn-ghost-d" style={{ opacity: cur === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={14} /> Prev
            </button>
            {!isRev ? (
              <button onClick={check} disabled={!canCheck} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: !canCheck ? 0.4 : 1 }}>
                Check answer
              </button>
            ) : cur < quiz.questions.length - 1 ? (
              <button onClick={next} className="btn-ghost-d" style={{ flex: 1, justifyContent: 'center' }}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={finish} disabled={submitting} className="btn-orange" style={{ flex: 1, justifyContent: 'center' }}>
                <Flag size={14} /> {submitting ? 'Saving…' : 'Finish quiz'}
              </button>
            )}
            <button onClick={next} disabled={cur === quiz.questions.length - 1} className="btn-ghost-d" style={{ opacity: cur === quiz.questions.length - 1 ? 0.3 : 1 }}>
              Skip <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
