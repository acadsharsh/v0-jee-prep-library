import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const { data, error } = await supabase
    .from('books')
    .select('*, chapters(id, title, chapter_number, class_identifier, slug)')
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'add_book') {
    const { title, slug, subject } = body;
    if (!title || !slug) return NextResponse.json({ error: 'title and slug required' }, { status: 400 });
    const { data, error } = await supabase.from('books').insert({ title, slug: slug.toLowerCase().replace(/\s+/g, '-'), subject }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === 'add_chapter') {
    const { bookId, title, chapterNumber, classIdentifier } = body;
    if (!bookId || !title || !chapterNumber) return NextResponse.json({ error: 'bookId, title, chapterNumber required' }, { status: 400 });
    const slug = `ch-${chapterNumber}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;
    const { data, error } = await supabase.from('chapters').insert({
      book_id: bookId,
      title,
      chapter_number: parseInt(chapterNumber),
      class_identifier: classIdentifier || 'common',
      slug,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === 'delete_book') {
    const { bookId } = body;
    const { error } = await supabase.from('books').delete().eq('id', bookId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete_chapter') {
    const { chapterId } = body;
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
