import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtDecode } from 'jwt-decode';

export async function POST(req: NextRequest) {
  try {
    const { quizId, score, timeTakenSeconds } = await req.json();

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const decoded: any = jwtDecode(token);
    const userId = decoded.sub;

    if (!userId || !quizId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    // Use real column names: score, time_taken_seconds, completed_at (auto)
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({ user_id: userId, quiz_id: quizId, score, time_taken_seconds: timeTakenSeconds })
      .select('*').single();

    if (error) throw error;
    return NextResponse.json(attempt, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating quiz attempt:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const decoded: any = jwtDecode(token);
    const userId = decoded.sub;

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(attempts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
