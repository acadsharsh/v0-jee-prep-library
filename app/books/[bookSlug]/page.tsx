'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChapterBrowser } from '@/components/chapter-browser';
import Link from 'next/link';

interface ChaptersData { [classId: string]: Array<{ id: string; book_id: string; class_identifier: string; chapter_number: number; title: string; slug: string; created_at: string; }>; }

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const { user } = useAuth();
  const ini = user?.email?.slice(0,2).toUpperCase() ?? 'U';
  const name = user?.email?.split('@')[0] ?? 'User';

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
    <div className="dbshell">
      <Navigation />
      <div className="sbmain">
        {/* Top bar */}
        <div className="dbtop">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Link href="/dashboard" style={{ fontSize:13,color:'var(--mu)',fontWeight:500 }}>← Dashboard</Link>
            <span style={{ color:'var(--bd)' }}>/</span>
            <div className="tbtitle">{bookTitle || bookSlug}</div>
            {!isLoading && total > 0 && (
              <span style={{ fontSize:11,fontWeight:600,color:'var(--pu)',background:'var(--pul)',padding:'2px 9px',borderRadius:100 }}>{total} chapters</span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="nbtn">🔔<span className="ndot" /></div>
            <div className="uchip"><div className="ucav">{ini}</div><span className="ucname">{name}</span></div>
          </div>
        </div>

        <div className="sub active">
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
