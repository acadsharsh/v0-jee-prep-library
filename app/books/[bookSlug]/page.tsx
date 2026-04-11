'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import Link from 'next/link';

interface ChaptersData { [classId:string]: Array<{id:string;book_id:string;class_identifier:string;chapter_number:number;title:string;slug:string;created_at:string;}>; }

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
        const book = books.find((b:any) => b.slug===bookSlug);
        if (book) setBookTitle(book.title);
      } catch(e){console.error(e);}
      finally{setIsLoading(false);}
    })();
  }, [bookSlug]);

  const total = Object.values(chapters).reduce((s,a) => s+a.length, 0);

  return (
    <>
      <Navigation />
      <main style={{ background:'var(--black)', minHeight:'calc(100vh - 52px)' }}>
        <div style={{ padding:'16px 40px', borderBottom:'1.5px solid var(--dim)', display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/" style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>← Library</Link>
          <span style={{ color:'var(--dim)' }}>/</span>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--lime)' }}>{bookTitle||bookSlug.toUpperCase()}</span>
          {!isLoading && total > 0 && <span style={{ fontSize:12, color:'var(--muted)' }}>{total} chapters</span>}
        </div>
        <div style={{ padding:'32px 40px', maxWidth:860 }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
