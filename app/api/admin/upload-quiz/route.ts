import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { QuizJSON } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { quizJson } = await req.json();

    // Validate the JSON structure
    const quiz: QuizJSON = typeof quizJson === 'string' ? JSON.parse(quizJson) : quizJson;

    if (!quiz.book_slug || !quiz.class_identifier || quiz.chapter_number === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: book_slug, class_identifier, chapter_number' },
        { status: 400 }
      );
    }

    // Check if book exists, create if not
    let bookId: string;
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', quiz.book_slug)
      .maybeSingle(); // safer than .single()

    if (existingBook) {
      bookId = existingBook.id;
    } else {
      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          slug: quiz.book_slug,
          title: quiz.book_title,
        })
        .select('id')
        .single();

      if (bookError) throw bookError;
      bookId = newBook!.id;
    }

    // Check if chapter exists, create if not
    let chapterId: string;
    const chapterSlug = `ch${quiz.chapter_number}-${quiz.chapter_title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')}`;

    const { data: existingChapter } = await supabase
      .from('chapters')
      .select('id')
      .eq('book_id', bookId)
      .eq('class_identifier', quiz.class_identifier)
      .eq('chapter_number', quiz.chapter_number)
      .maybeSingle(); // safer than .single()

    if (existingChapter) {
      chapterId = existingChapter.id;
    } else {
      const { data: newChapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          book_id: bookId,
          class_identifier: quiz.class_identifier,
          chapter_number: quiz.chapter_number,
          title: quiz.chapter_title,
          slug: chapterSlug,
        })
        .select('id')
        .single();

      if (chapterError) throw chapterError;
      chapterId = newChapter!.id;
    }

    // Encode quiz JSON as base64 data URI
    const jsonBlobUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(quiz)).toString('base64')}`;

    // UPSERT: if a quiz already exists for this chapter, replace it instead of inserting a duplicate
    const { data: upsertedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .upsert(
        {
          chapter_id: chapterId,
          json_blob_url: jsonBlobUrl,
          difficulty: quiz.difficulty,
          title: quiz.quiz_title,
          description: quiz.quiz_description,
        },
        {
          onConflict: 'chapter_id', // requires UNIQUE constraint on chapter_id (see note below)
          ignoreDuplicates: false,  // update existing row if found
        }
      )
      .select('id')
      .single();

    if (quizError) throw quizError;

    return NextResponse.json(
      {
        success: true,
        quizId: upsertedQuiz.id,
        message: `Quiz "${quiz.quiz_title}" saved successfully!`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Error uploading quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload quiz' },
      { status: 500 }
    );
  }
}
