'use client';
import { useState, useEffect } from 'react';
import { QuizJSON, QuizQuestion, QuestionType } from '@/lib/types';

interface QuizInterfaceProps {
  quiz: QuizJSON;
  quizId: string;
  onSubmit: (answers: { [k: string]: any }, timeTaken: number, score: number) => Promise<void>;
}

function getQuestionType(q: QuizQuestion): QuestionType {
  if (q.type) return q.type;
  if (q.correctOptionIds) return 'msq';
  if (q.correctAnswer !== undefined) return 'numerical';
  return 'mcq';
}

function TypeBadge({ type }: { type: QuestionType }) {
  const cfg: Record<QuestionType, { label: string; color: string }> = {
    mcq: { label: 'MCQ', color: 'var(--lime)' },
    msq: { label: 'MSQ', color: 'var(--mint)' },
    numerical: { label: 'NUM', color: 'var(--yellow)' },
  };
  const c = cfg[type];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px',
      border: `1.5px solid ${c.color}`,
      color: c.color, fontFamily: 'Space Mono, monospace',
      letterSpacing: '0.06em',
    }}>{c.label}</span>
  );
}

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [cur, setCur] = useState(0);
  // answers: mcq → string, msq → string[], numerical → string (user input)
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
  const qType = getQuestionType(q);
  const sel = answers[q.id];
  const isRev = revealed[q.id];
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isLow = timeLeft < 300;

  // Scoring
  const calcScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const type = getQuestionType(question);
      const ans = answers[question.id];
      if (type === 'mcq' && ans === question.correctOptionId) correct++;
      else if (type === 'msq' && Array.isArray(ans)) {
        const correctSet = new Set(question.correctOptionIds ?? []);
        const ansSet = new Set(ans as string[]);
        if (correctSet.size === ansSet.size && [...correctSet].every(x => ansSet.has(x))) correct++;
      } else if (type === 'numerical') {
        const num = parseFloat(ans);
        const correct_ = question.correctAnswer ?? 0;
        const tol = question.tolerance ?? 0;
        if (!isNaN(num) && Math.abs(num - correct_) <= tol) correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  // MCQ select
  const selectMCQ = (optId: string) => {
    if (isRev) return;
    setAnswers(p => ({ ...p, [q.id]: optId }));
  };

  // MSQ toggle
  const toggleMSQ = (optId: string) => {
    if (isRev) return;
    const cur_ = (answers[q.id] as string[]) ?? [];
    const next = cur_.includes(optId) ? cur_.filter((x: string) => x !== optId) : [...cur_, optId];
    setAnswers(p => ({ ...p, [q.id]: next }));
  };

  const check = () => {
    if (qType === 'numerical') {
      const val = numInput[q.id] ?? '';
      if (!val.trim()) return;
      setAnswers(p => ({ ...p, [q.id]: val }));
    }
    if (!answers[q.id] && qType !== 'numerical') return;
    setRevealed(p => ({ ...p, [q.id]: true }));
  };

  const next = () => { if (cur < quiz.questions.length - 1) setCur(p => p + 1); };
  const prev = () => { if (cur > 0) setCur(p => p - 1); };

  const finish = async () => {
    setSubmitting(true);
    const score = calcScore();
    await onSubmit(answers, Math.floor((Date.now() - start) / 1000), score);
    setSubmitting(false);
  };

  // Option style for MCQ
  const mcqOptStyle = (optId: string) => {
    const isSel = sel === optId;
    const isC = optId === q.correctOptionId;
    if (!isRev) return isSel ? 'opt-selected' : 'opt-default';
    if (isC) return 'opt-correct';
    if (isSel) return 'opt-wrong';
    return 'opt-dim';
  };

  // Option style for MSQ
  const msqOptStyle = (optId: string) => {
    const selArr = (sel as string[]) ?? [];
    const isSel = selArr.includes(optId);
    const isC = (q.correctOptionIds ?? []).includes(optId);
    if (!isRev) return isSel ? 'opt-selected' : 'opt-default';
    if (isC) return 'opt-correct';
    if (isSel && !isC) return 'opt-wrong';
    return 'opt-dim';
  };

  // Numerical correctness check
  const numCorrect = () => {
    const num = parseFloat(answers[q.id]);
    const correct = q.correctAnswer ?? 0;
    const tol = q.tolerance ?? 0;
    return !isNaN(num) && Math.abs(num - correct) <= tol;
  };

  const bubbleColor = (idx: number) => {
    const bq = quiz.questions[idx];
    if (idx === cur) return { bg: 'var(--lime)', color: 'var(--black)', border: 'var(--lime)' };
    if (answers[bq.id] !== undefined && answers[bq.id] !== '') {
      if (!revealed[bq.id]) return { bg: 'transparent', color: 'var(--white)', border: 'var(--white)' };
      const bType = getQuestionType(bq);
      let correct = false;
      if (bType === 'mcq') correct = answers[bq.id] === bq.correctOptionId;
      else if (bType === 'msq') {
        const cs = new Set(bq.correctOptionIds ?? []);
        const as_ = new Set(answers[bq.id] as string[]);
        correct = cs.size === as_.size && [...cs].every(x => as_.has(x));
      } else {
        const num = parseFloat(answers[bq.id]);
        correct = !isNaN(num) && Math.abs(num - (bq.correctAnswer ?? 0)) <= (bq.tolerance ?? 0);
      }
      return correct
        ? { bg: 'transparent', color: 'var(--mint)', border: 'var(--mint)' }
        : { bg: 'transparent', color: '#ff4444', border: '#ff4444' };
    }
    return { bg: 'transparent', color: 'var(--muted)', border: 'var(--dim)' };
  };

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const answered = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '' && (!Array.isArray(answers[k]) || answers[k].length > 0)).length;
  const correct = quiz.questions.filter(question => {
    const t = getQuestionType(question);
    const a = answers[question.id];
    if (!a) return false;
    if (t === 'mcq') return a === question.correctOptionId;
    if (t === 'msq') {
      const cs = new Set(question.correctOptionIds ?? []);
      const as_ = new Set(a as string[]);
      return cs.size === as_.size && [...cs].every(x => as_.has(x));
    }
    return !isNaN(parseFloat(a)) && Math.abs(parseFloat(a) - (question.correctAnswer ?? 0)) <= (question.tolerance ?? 0);
  }).length;

  const canCheck = qType === 'numerical'
    ? !!(numInput[q.id]?.trim())
    : qType === 'msq'
      ? !!(sel && (sel as string[]).length > 0)
      : !!sel;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>

      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: '1.5px solid var(--dim)', background: 'var(--black-2)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Timer */}
        <div style={{ padding: '12px', border: `1.5px solid ${isLow ? '#ff4444' : 'var(--dim)'}`, textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 24, fontWeight: 700, color: isLow ? '#ff4444' : 'var(--white)', background: isLow ? 'rgba(255,68,68,0.06)' : 'transparent' }}>
          {fmt(timeLeft)}
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Mono, monospace' }}>
          {revealed ? `${correct}/${answered}` : `${answered}/${quiz.questions.length}`}
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--dim)' }}>
          <div style={{ height: '100%', background: 'var(--lime)', width: `${((cur + 1) / quiz.questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Bubbles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {quiz.questions.map((_, idx) => {
            const bc = bubbleColor(idx);
            return (
              <button key={idx} onClick={() => setCur(idx)} style={{ width: 28, height: 28, background: bc.bg, color: bc.color, border: `1.5px solid ${bc.border}`, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Mono, monospace', transition: 'all 0.1s' }}>
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {[
          { color: 'var(--lime)', label: 'Current' },
          { color: 'var(--mint)', label: 'Correct' },
          { color: '#ff4444', label: 'Wrong' },
          { color: 'var(--muted)', label: 'Untouched' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--muted)' }}>
            <div style={{ width: 8, height: 8, background: l.color, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Question area */}
      <div style={{ flex: 1, padding: '32px 40px', maxWidth: 760, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 16, borderBottom: '1.5px solid var(--dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--lime)' }}>
              Q{cur + 1}<span style={{ color: 'var(--muted)' }}>/{quiz.questions.length}</span>
            </span>
            <TypeBadge type={qType} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {quiz.quiz_title}
          </span>
        </div>

        <div key={cur} style={{ animation: 'fadeUp 0.25s ease both' }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* MSQ instruction */}
          {qType === 'msq' && (
            <div style={{ fontSize: 12, color: 'var(--mint)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✦ Multiple correct answers — select all that apply
            </div>
          )}

          <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--white)', marginBottom: 28, fontWeight: 500 }}>
            {q.questionText}
          </p>

          {/* MCQ options */}
          {qType === 'mcq' && q.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {q.options.map((opt, i) => {
                const isC = opt.id === q.correctOptionId;
                const isSel = sel === opt.id;
                return (
                  <div key={opt.id} className={mcqOptStyle(opt.id)} onClick={() => selectMCQ(opt.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 16px', cursor: isRev ? 'default' : 'pointer', transition: 'all 0.1s' }}>
                    <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid currentColor', flexShrink: 0, fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700 }}>{letters[i]}</span>
                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.55 }}>{opt.text}</span>
                    {isRev && isC && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mint)', flexShrink: 0, textTransform: 'uppercase' }}>✓</span>}
                    {isRev && isSel && !isC && <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4444', flexShrink: 0 }}>✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* MSQ options */}
          {qType === 'msq' && q.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {q.options.map((opt, i) => {
                const isC = (q.correctOptionIds ?? []).includes(opt.id);
                const selArr = (sel as string[]) ?? [];
                const isSel = selArr.includes(opt.id);
                return (
                  <div key={opt.id} className={msqOptStyle(opt.id)} onClick={() => toggleMSQ(opt.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 16px', cursor: isRev ? 'default' : 'pointer', transition: 'all 0.1s' }}>
                    {/* Square checkbox indicator for MSQ */}
                    <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid currentColor', flexShrink: 0, fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, background: isSel ? 'currentColor' : 'transparent' }}>
                      {isSel && <span style={{ color: 'var(--black)', fontSize: 12 }}>✓</span>}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.55 }}>{opt.text}</span>
                    {isRev && isC && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mint)', flexShrink: 0, textTransform: 'uppercase' }}>✓ Correct</span>}
                    {isRev && isSel && !isC && <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4444', flexShrink: 0 }}>✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Numerical input */}
          {qType === 'numerical' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
                Enter your answer {q.tolerance ? `(±${q.tolerance} accepted)` : ''}
              </div>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={numInput[q.id] ?? ''}
                disabled={isRev}
                onChange={e => {
                  setNumInput(p => ({ ...p, [q.id]: e.target.value }));
                  if (!isRev) setAnswers(p => ({ ...p, [q.id]: e.target.value }));
                }}
                style={{
                  width: 220,
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 18, fontWeight: 700,
                  padding: '12px 16px',
                  color: isRev ? (numCorrect() ? 'var(--mint)' : '#ff4444') : 'var(--white)',
                  borderColor: isRev ? (numCorrect() ? 'var(--mint)' : '#ff4444') : 'var(--dim)',
                }}
              />
              {isRev && (
                <div style={{ marginTop: 10, fontSize: 13, fontFamily: 'Space Mono, monospace' }}>
                  Correct answer: <span style={{ color: 'var(--lime)', fontWeight: 700 }}>{q.correctAnswer}</span>
                  {q.tolerance ? <span style={{ color: 'var(--muted)' }}> ±{q.tolerance}</span> : ''}
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {isRev && q.explanation && (
            <div style={{ padding: '14px 18px', marginBottom: 24, borderLeft: `3px solid ${(qType === 'mcq' && sel === q.correctOptionId) || (qType === 'numerical' && numCorrect()) ? 'var(--mint)' : '#ff4444'}`, background: 'var(--black-2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 6 }}>Explanation</div>
              <p style={{ fontSize: 13.5, color: 'var(--white)', lineHeight: 1.65 }}>{q.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={prev} disabled={cur === 0} className="btn-outline" style={{ opacity: cur === 0 ? 0.25 : 1 }}>← Prev</button>
            {!isRev ? (
              <button onClick={check} disabled={!canCheck} className="btn-lime" style={{ flex: 1, justifyContent: 'center', opacity: !canCheck ? 0.35 : 1 }}>
                Check answer
              </button>
            ) : cur < quiz.questions.length - 1 ? (
              <button onClick={next} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Next →</button>
            ) : (
              <button onClick={finish} disabled={submitting} className="btn-lime" style={{ flex: 1, justifyContent: 'center', background: 'var(--mint)', borderColor: 'var(--mint)', color: 'var(--black)' }}>
                {submitting ? 'Saving…' : 'Finish ✦'}
              </button>
            )}
            <button onClick={next} disabled={cur === quiz.questions.length - 1} className="btn-outline" style={{ opacity: cur === quiz.questions.length - 1 ? 0.25 : 1 }}>Skip →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
