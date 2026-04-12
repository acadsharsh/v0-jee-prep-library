'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ChaptersData { [classId: string]: Array<{ id: string; book_id: string; class_identifier: string; chapter_number: number; title: string; slug: string; created_at: string; }>; }

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [cr, br] = await Promise.all([fetch(`/api/books/${bookSlug}/chapters`), fetch('/api/books')]);
        const data = await cr.json(); const books = await br.json();
        setChapters(data);
        const book = books.find((b: any) => b.slug === bookSlug);
        if (book) setBookTitle(book.title);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug]);

  const total = Object.values(chapters).reduce((s, a) => s + a.length, 0);

  return (
    <>
      <Navigation />
      <main className="dash-root" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8EAF0', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C8DB0', fontWeight: 800 }}>
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <span style={{ color: '#E8EAF0' }}>›</span>
          <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#1A1A2E' }}>{bookTitle || bookSlug}</span>
          {!isLoading && total > 0 && (
            <span style={{ padding: '2px 12px', borderRadius: 100, background: '#EDE9FE', color: '#7C3AED', fontSize: 11, fontWeight: 800 }}>{total} chapters</span>
          )}
        </div>
        <div style={{ padding: '28px', maxWidth: 900 }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
