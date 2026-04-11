import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { bookSlug } = await params;

    // Get the book first
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', bookSlug)
      .single();

    if (bookError) throw new Error('Book not found');

    // Get chapters grouped by class
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', book.id)
      .order('class_identifier', { ascending: true })
      .order('chapter_number', { ascending: true });

    if (chaptersError) throw chaptersError;

    // Group by class_identifier
    const grouped = chapters.reduce((acc: any, chapter) => {
      if (!acc[chapter.class_identifier]) {
        acc[chapter.class_identifier] = [];
      }
      acc[chapter.class_identifier].push(chapter);
      return acc;
    }, {});

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error('[API] Error fetching chapters:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
