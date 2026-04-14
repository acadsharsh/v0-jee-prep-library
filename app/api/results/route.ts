import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role bypasses RLS safely server-side
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify user from token
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quizId, score, timeTakenSeconds, questionResults, chapterId, bookId } = await req.json();

    // 1. Save quiz attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .insert({ user_id: user.id, quiz_id: quizId, score, time_taken_seconds: timeTakenSeconds })
      .select('id').single();

    if (attemptErr) throw attemptErr;

    // 2. Save per-question results
    if (questionResults?.length) {
      const rows = questionResults.map((qr: any) => ({
        user_id: user.id,
        quiz_id: quizId,
        question_id: qr.questionId,
        chapter_id: chapterId ?? null,
        book_id: bookId ?? null,
        question_text: qr.questionText,
        correct: qr.correct,
        user_answer: String(qr.userAnswer ?? ''),
        correct_answer: String(qr.correctAnswer ?? ''),
        explanation: qr.explanation ?? null,
        question_type: qr.type ?? 'mcq',
        time_spent_sec: qr.timeSpent ?? 0,
      }));

      const { data: savedResults, error: resultsErr } = await supabase
        .from('question_results')
        .insert(rows)
        .select('id, question_id, correct');

      if (resultsErr) console.error('question_results error:', resultsErr);

      // 3. Upsert mistakes for wrong answers
      const wrongOnes = questionResults.filter((qr: any) => !qr.correct);
      for (const qr of wrongOnes) {
        const { data: existing } = await supabase
          .from('mistake_notebook')
          .select('id, times_wrong')
          .eq('user_id', user.id)
          .eq('question_id', qr.questionId)
          .maybeSingle();

        if (existing) {
          await supabase.from('mistake_notebook').update({
            times_wrong: existing.times_wrong + 1,
            last_wrong_at: new Date().toISOString(),
            resolved: false,
          }).eq('id', existing.id);
        } else {
          await supabase.from('mistake_notebook').insert({
            user_id: user.id,
            quiz_id: quizId,
            question_id: qr.questionId,
            chapter_id: chapterId ?? null,
            book_id: bookId ?? null,
            question_text: qr.questionText,
            correct_answer: String(qr.correctAnswer ?? ''),
            explanation: qr.explanation ?? null,
            question_type: qr.type ?? 'mcq',
            times_wrong: 1,
          });
        }
      }

      // 4. Auto-create flashcards from wrong answers (if not existing)
      for (const qr of wrongOnes) {
        const { count } = await supabase
          .from('flashcards')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('question_id', qr.questionId);

        if (!count || count === 0) {
          await supabase.from('flashcards').insert({
            user_id: user.id,
            source: 'mistake',
            question_id: qr.questionId,
            chapter_id: chapterId ?? null,
            front_text: qr.questionText ?? 'Question',
            back_text: `Correct: ${qr.correctAnswer}\n\n${qr.explanation ?? ''}`,
          });
        }
      }
    }

    // 5. Update daily activity
    await supabase.rpc('record_daily_activity', {
      p_user_id: user.id,
      p_questions: questionResults?.length ?? 0,
      p_correct: questionResults?.filter((q: any) => q.correct).length ?? 0,
    });

    // 6. Check & award badges
    const { count: totalCount } = await supabase
      .from('question_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (totalCount && totalCount >= 1) {
      await supabase.from('badges').insert({ user_id: user.id, badge_type: 'first_attempt' }).onConflict('user_id, badge_type').ignore();
    }
    if (totalCount && totalCount >= 100) {
      await supabase.from('badges').insert({ user_id: user.id, badge_type: 'century' }).onConflict('user_id, badge_type').ignore();
    }
    if (score === 100) {
      await supabase.from('badges').insert({ user_id: user.id, badge_type: 'perfectionist' }).onConflict('user_id, badge_type').ignore();
    }

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error: any) {
    console.error('[results] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
