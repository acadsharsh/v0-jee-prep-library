import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { QuizJSON } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { quizId } = await params;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (error) throw error;

    // Decode the JSON from blob URL
    let quizContent: QuizJSON;
    if (quiz.json_blob_url.startsWith('data:')) {
      // Base64 encoded data URI
      const base64 = quiz.json_blob_url.split(',')[1];
      quizContent = JSON.parse(Buffer.from(base64, 'base64').toString());
    } else {
      // Fetch from URL (for production with Vercel Blob)
      const response = await fetch(quiz.json_blob_url);
      quizContent = await response.json();
    }

    return NextResponse.json({
      ...quiz,
      content: quizContent,
    });
  } catch (error: any) {
    console.error('[API] Error fetching quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
