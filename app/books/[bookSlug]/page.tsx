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
      <main style={{ background: '#12141f', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ background: '#1a1c2e', borderBottom: '1px solid #2d3255', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280', fontWeight: 700 }}>
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <span style={{ color: '#2d3255' }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>{bookTitle || bookSlug}</span>
          {!isLoading && total > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: 100, background: 'rgba(123,108,246,0.2)', color: '#7b6cf6', fontSize: 11, fontWeight: 800 }}>{total} chapters</span>
          )}
        </div>
        <div style={{ padding: '28px', maxWidth: 900 }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
