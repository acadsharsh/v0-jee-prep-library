'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ChaptersData {
  [classId: string]: Array<{ id: string; book_id: string; class_identifier: string; chapter_number: number; title: string; slug: string; created_at: string; }>;
}

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [chapRes, booksRes] = await Promise.all([fetch(`/api/books/${bookSlug}/chapters`), fetch('/api/books')]);
        const data = await chapRes.json();
        const books = await booksRes.json();
        setChapters(data);
        const book = books.find((b: any) => b.slug === bookSlug);
        if (book) setBookTitle(book.title);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug]);

  const totalChapters = Object.values(chapters).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--bg-0)', minHeight: 'calc(100vh - 48px)' }}>

        {/* Breadcrumb header */}
        <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--tx-3)' }}>
            <ChevronLeft size={13} /> Library
          </Link>
          <span style={{ color: 'var(--border-mid)' }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>{bookTitle || bookSlug}</span>
          {!isLoading && totalChapters > 0 && (
            <span style={{ fontSize: 12, color: 'var(--tx-3)', marginLeft: 2 }}>{totalChapters} chapters</span>
          )}
        </div>

        <div style={{ padding: '24px 32px', maxWidth: 860 }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
