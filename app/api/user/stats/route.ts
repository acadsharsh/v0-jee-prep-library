import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Real columns: score, completed_at (not score_percentage, created_at)
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, completed_at, quiz_id')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ totalAttempts: 0, averageScore: 0, lastAttempt: null, topicsCovered: 0 });
    }

    const avgScore = attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / attempts.length;
    const uniqueQuizzes = new Set(attempts.map(a => a.quiz_id)).size;

    return NextResponse.json({
      totalAttempts: attempts.length,
      averageScore: Math.round(avgScore),
      lastAttempt: new Date(attempts[0].completed_at).toLocaleDateString(),
      topicsCovered: uniqueQuizzes,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
