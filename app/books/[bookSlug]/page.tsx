'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ChaptersData { [classId:string]:Array<{ id:string; book_id:string; class_identifier:string; chapter_number:number; title:string; slug:string; created_at:string; }>; }

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
      } catch(e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [bookSlug]);

  const total = Object.values(chapters).reduce((s,a) => s+a.length, 0);

  return (
    <>
      <Navigation />
      <main style={{ background:'#0d0d0d', minHeight:'calc(100vh - 58px)' }}>
        <div style={{ background:'#0d0d0d', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 28px', display:'flex', alignItems:'center', gap:12 }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>
            <ChevronLeft size={13}/> Dashboard
          </Link>
          <span style={{ color:'rgba(255,255,255,0.15)' }}>›</span>
          <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{bookTitle||bookSlug}</span>
          {!isLoading && total>0 && (
            <span style={{ padding:'2px 10px', borderRadius:100, background:'rgba(155,127,232,0.15)', color:'#9B7FE8', fontSize:10, fontWeight:800 }}>{total} chapters</span>
          )}
        </div>
        <div style={{ padding:'28px', maxWidth:900 }}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
