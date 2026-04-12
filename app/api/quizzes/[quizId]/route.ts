import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { QuizJSON } from '@/lib/types';

async function decodeQuiz(quiz: any): Promise<any> {
  let content: QuizJSON;
  if (quiz.json_blob_url.startsWith('data:')) {
    const base64 = quiz.json_blob_url.split(',')[1];
    content = JSON.parse(Buffer.from(base64, 'base64').toString());
  } else {
    const response = await fetch(quiz.json_blob_url);
    content = await response.json();
  }
  return { ...quiz, content };
}

// quizId here is actually chapter_id — return ALL quizzes for the chapter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('chapter_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ error: 'No quizzes found for this chapter' }, { status: 404 });
    }

    // Decode all quizzes
    const decoded = await Promise.all(quizzes.map(decodeQuiz));
    return NextResponse.json(decoded);
  } catch (error: any) {
    console.error('[API] Error fetching quizzes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
