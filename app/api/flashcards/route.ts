import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// SM-2 algorithm
function sm2(easeFactor: number, interval: number, reps: number, quality: number) {
  // quality: 0=blackout, 1=wrong, 2=hard, 3=ok, 4=easy, 5=perfect
  let newEF = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;
  let newReps: number;
  if (quality < 3) { newInterval = 1; newReps = 0; }
  else {
    newReps = reps + 1;
    newInterval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * newEF);
  }
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  return { easeFactor: newEF, interval: newInterval, reps: newReps, nextReview };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const dueOnly = url.searchParams.get('due') === 'true';

  let query = supabase.from('flashcards').select(`*, chapters(title, books(title))`).eq('user_id', user.id);
  if (dueOnly) query = query.lte('next_review_at', new Date().toISOString());
  query = query.order('next_review_at', { ascending: true });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, quality } = await req.json(); // quality 0-5

  const { data: card } = await supabase.from('flashcards').select('*').eq('id', id).single();
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { easeFactor, interval, reps, nextReview } = sm2(
    card.ease_factor, card.interval_days, card.repetitions, quality
  );

  const { error } = await supabase.from('flashcards').update({
    ease_factor: easeFactor,
    interval_days: interval,
    repetitions: reps,
    next_review_at: nextReview.toISOString(),
    last_reviewed_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, nextReview });
}
