import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [
    { data: attempts },
    { data: qResults },
    { data: mistakes },
    { data: daily },
    { data: badges },
    { data: flashcards },
    { count: totalQ },
    { count: wrongQ },
  ] = await Promise.all([
    supabase.from('quiz_attempts').select('score, completed_at, quiz_id').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(20),
    supabase.from('question_results').select('correct, chapter_id, chapters(title, books(title, subject))').eq('user_id', user.id),
    supabase.from('mistake_notebook').select('chapter_id, times_wrong, resolved, chapters(title, books(title))').eq('user_id', user.id).eq('resolved', false),
    supabase.from('daily_activity').select('date, questions_attempted, correct_count').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    supabase.from('badges').select('badge_type, earned_at').eq('user_id', user.id),
    supabase.from('flashcards').select('id, next_review_at').eq('user_id', user.id),
    supabase.from('question_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('question_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('correct', false),
  ]);

  const chapterMap: Record<string, { title: string; bookTitle: string; total: number; correct: number }> = {};
  (qResults ?? []).forEach((r: any) => {
    const cid = r.chapter_id ?? 'unknown';
    if (!chapterMap[cid]) chapterMap[cid] = { title: r.chapters?.title ?? 'Unknown', bookTitle: r.chapters?.books?.title ?? '', total: 0, correct: 0 };
    chapterMap[cid].total++;
    if (r.correct) chapterMap[cid].correct++;
  });

  const mistakesByChapter: Record<string, { title: string; bookTitle: string; count: number }> = {};
  (mistakes ?? []).forEach((m: any) => {
    const cid = m.chapter_id ?? 'unknown';
    if (!mistakesByChapter[cid]) mistakesByChapter[cid] = { title: m.chapters?.title ?? 'Unknown', bookTitle: m.chapters?.books?.title ?? '', count: 0 };
    mistakesByChapter[cid].count += m.times_wrong;
  });

  const dueFlashcards = (flashcards ?? []).filter(f => new Date(f.next_review_at) <= new Date()).length;

  let streak = 0;
  const sortedDays = (daily ?? []).map(d => d.date).sort().reverse();
  for (let i = 0; i < sortedDays.length; i++) {
    const expected = new Date(); expected.setDate(expected.getDate() - i);
    if (sortedDays[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }

  return NextResponse.json({
    totalAttempts: attempts?.length ?? 0,
    avgScore: attempts?.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0,
    totalQuestions: totalQ ?? 0,
    totalWrong: wrongQ ?? 0,
    accuracy: totalQ ? Math.round(((totalQ - (wrongQ ?? 0)) / totalQ) * 100) : 0,
    streak,
    mistakes: mistakes?.length ?? 0,
    dueFlashcards,
    badges: badges ?? [],
    chapterAccuracy: Object.entries(chapterMap).map(([id, v]) => ({ id, ...v, accuracy: Math.round((v.correct / v.total) * 100) })).sort((a, b) => a.accuracy - b.accuracy),
    topMistakeChapters: Object.entries(mistakesByChapter).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count).slice(0, 5),
    recentAttempts: attempts?.slice(0, 10) ?? [],
    dailyActivity: daily ?? [],
  });
}
