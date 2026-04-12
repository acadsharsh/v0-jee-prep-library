import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { QuizJSON } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { quizJson } = await req.json();
    const quiz: QuizJSON = typeof quizJson === 'string' ? JSON.parse(quizJson) : quizJson;

    if (!quiz.book_slug || !quiz.class_identifier || quiz.chapter_number === undefined || !quiz.quiz_title) {
      return NextResponse.json(
        { error: 'Missing required fields: book_slug, class_identifier, chapter_number, quiz_title' },
        { status: 400 }
      );
    }

    // Upsert book
    let bookId: string;
    const { data: existingBook } = await supabase.from('books').select('id').eq('slug', quiz.book_slug).maybeSingle();
    if (existingBook) {
      bookId = existingBook.id;
    } else {
      const { data: newBook, error: bookError } = await supabase.from('books')
        .insert({ slug: quiz.book_slug, title: quiz.book_title }).select('id').single();
      if (bookError) throw bookError;
      bookId = newBook!.id;
    }

    // Upsert chapter
    let chapterId: string;
    const chapterSlug = `ch${quiz.chapter_number}-${quiz.chapter_title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
    const { data: existingChapter } = await supabase.from('chapters').select('id')
      .eq('book_id', bookId).eq('class_identifier', quiz.class_identifier).eq('chapter_number', quiz.chapter_number).maybeSingle();
    if (existingChapter) {
      chapterId = existingChapter.id;
    } else {
      const { data: newChapter, error: chapterError } = await supabase.from('chapters')
        .insert({ book_id: bookId, class_identifier: quiz.class_identifier, chapter_number: quiz.chapter_number, title: quiz.chapter_title, slug: chapterSlug })
        .select('id').single();
      if (chapterError) throw chapterError;
      chapterId = newChapter!.id;
    }

    const jsonBlobUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(quiz)).toString('base64')}`;

    // Check if a quiz with this exact title already exists for this chapter — update it, else insert new
    const { data: existingQuiz } = await supabase.from('quizzes').select('id')
      .eq('chapter_id', chapterId).eq('title', quiz.quiz_title).maybeSingle();

    let quizId: string;
    if (existingQuiz) {
      const { error } = await supabase.from('quizzes').update({
        json_blob_url: jsonBlobUrl,
        difficulty: quiz.difficulty,
        description: quiz.quiz_description,
      }).eq('id', existingQuiz.id);
      if (error) throw error;
      quizId = existingQuiz.id;
    } else {
      const { data: newQuiz, error } = await supabase.from('quizzes').insert({
        chapter_id: chapterId,
        json_blob_url: jsonBlobUrl,
        difficulty: quiz.difficulty,
        title: quiz.quiz_title,
        description: quiz.quiz_description,
      }).select('id').single();
      if (error) throw error;
      quizId = newQuiz!.id;
    }

    return NextResponse.json({ success: true, quizId, message: `"${quiz.quiz_title}" saved successfully!` }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error uploading quiz:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload quiz' }, { status: 500 });
  }
}
