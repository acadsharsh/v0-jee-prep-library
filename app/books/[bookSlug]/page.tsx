'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import Link from 'next/link';

interface ChaptersData { [classId: string]: Array<{ id: string; book_id: string; class_identifier: string; chapter_number: number; title: string; slug: string; created_at: string; }>; }

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const total = Object.values(chapters).reduce((s, a) => s + a.length, 0);

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

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Navigation />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>← Dashboard</Link>
            <span style={{ color: 'var(--faint)' }}>/</span>
            <div className="topbar-title">{bookTitle || bookSlug}</div>
            {!isLoading && total > 0 && <span className="badge badge-muted">{total} chapters</span>}
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
