import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { QuizJSON } from '@/lib/types';

async function decodeQuiz(quiz: any): Promise<any> {
  try {
    let content: QuizJSON;
    if (quiz.json_blob_url.startsWith('data:')) {
      const base64 = quiz.json_blob_url.split(',')[1];
      content = JSON.parse(Buffer.from(base64, 'base64').toString());
    } else {
      const response = await fetch(quiz.json_blob_url);
      content = await response.json();
    }
    return { ...quiz, content };
  } catch (e: any) {
    console.error('Failed to decode quiz:', e.message);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    // Use .select() without .single() to avoid PGRST116
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('chapter_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ error: 'No practice sets found for this chapter' }, { status: 404 });
    }

    const decoded = (await Promise.all(quizzes.map(decodeQuiz))).filter(Boolean);
    if (decoded.length === 0) {
      return NextResponse.json({ error: 'Failed to decode practice sets' }, { status: 500 });
    }
    return NextResponse.json(decoded);
  } catch (error: any) {
    console.error('[API] Error fetching quizzes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
