import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { QuizJSON } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizJson, targetChapterId } = body; // targetChapterId = user-selected chapter
    const quiz: QuizJSON = typeof quizJson === 'string' ? JSON.parse(quizJson) : quizJson;

    if (!quiz.quiz_title) {
      return NextResponse.json({ error: 'quiz_title is required in JSON' }, { status: 400 });
    }

    let chapterId: string;

    if (targetChapterId) {
      // User explicitly picked a chapter — use it directly
      chapterId = targetChapterId;
    } else {
      // Auto-detect from JSON (legacy path)
      if (!quiz.book_slug || quiz.chapter_number === undefined) {
        return NextResponse.json({ error: 'Either select a chapter above, or include book_slug + chapter_number in JSON' }, { status: 400 });
      }

      // Upsert book
      let bookId: string;
      const { data: existingBook } = await supabase.from('books').select('id').eq('slug', quiz.book_slug).maybeSingle();
      if (existingBook) {
        bookId = existingBook.id;
      } else {
        const { data: newBook, error: bookError } = await supabase.from('books')
          .insert({ slug: quiz.book_slug, title: quiz.book_title ?? quiz.book_slug }).select('id').single();
        if (bookError) throw bookError;
        bookId = newBook!.id;
      }

      // Upsert chapter
      const { data: existingCh } = await supabase.from('chapters').select('id')
        .eq('book_id', bookId)
        .eq('class_identifier', quiz.class_identifier ?? 'common')
        .eq('chapter_number', quiz.chapter_number).maybeSingle();

      if (existingCh) {
        chapterId = existingCh.id;
      } else {
        const slug = `ch-${quiz.chapter_number}-${(quiz.chapter_title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;
        const { data: newCh, error: chErr } = await supabase.from('chapters').insert({
          book_id: bookId,
          class_identifier: quiz.class_identifier ?? 'common',
          chapter_number: quiz.chapter_number,
          title: quiz.chapter_title ?? `Chapter ${quiz.chapter_number}`,
          slug,
        }).select('id').single();
        if (chErr) throw chErr;
        chapterId = newCh!.id;
      }
    }

    const jsonBlobUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(quiz)).toString('base64')}`;

    // Check if quiz with same title exists in this chapter
    const { data: existingQuiz } = await supabase.from('quizzes').select('id')
      .eq('chapter_id', chapterId).eq('title', quiz.quiz_title).maybeSingle();

    let quizId: string;
    if (existingQuiz) {
      await supabase.from('quizzes').update({
        json_blob_url: jsonBlobUrl,
        difficulty: quiz.difficulty ?? null,
        description: quiz.quiz_description ?? null,
      }).eq('id', existingQuiz.id);
      quizId = existingQuiz.id;
      return NextResponse.json({ success: true, quizId, message: `"${quiz.quiz_title}" updated (${quiz.questions?.length ?? 0} questions)` }, { status: 200 });
    } else {
      const { data: newQuiz, error } = await supabase.from('quizzes').insert({
        chapter_id: chapterId,
        json_blob_url: jsonBlobUrl,
        difficulty: quiz.difficulty ?? null,
        title: quiz.quiz_title,
        description: quiz.quiz_description ?? null,
      }).select('id').single();
      if (error) throw error;
      quizId = newQuiz!.id;
      return NextResponse.json({ success: true, quizId, message: `"${quiz.quiz_title}" uploaded (${quiz.questions?.length ?? 0} questions)` }, { status: 201 });
    }
  } catch (error: any) {
    console.error('[upload-quiz]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
