'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import { ChevronLeft, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

interface ChaptersData {
  [classId: string]: Array<{
    id: string;
    book_id: string;
    class_identifier: string;
    chapter_number: number;
    title: string;
    slug: string;
    created_at: string;
  }>;
}

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const [totalChapters, setTotalChapters] = useState(0);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [chapRes, booksRes] = await Promise.all([
          fetch(`/api/books/${bookSlug}/chapters`),
          fetch('/api/books'),
        ]);
        const data = await chapRes.json();
        const books = await booksRes.json();
        setChapters(data);
        const total = Object.values(data as ChaptersData).reduce((s, arr) => s + arr.length, 0);
        setTotalChapters(total);
        const book = books.find((b: any) => b.slug === bookSlug);
        if (book) setBookTitle(book.title);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch_();
  }, [bookSlug]);

  const classCount = Object.keys(chapters).length;

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Back */}
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#8b92a5',
            textDecoration: 'none', marginBottom: 32,
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}>
            <ChevronLeft size={14} /> Library
          </Link>

          {/* Header */}
          <div className="animate-fade-up" style={{ marginBottom: 44 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={24} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 34, letterSpacing: '-0.5px',
                  color: '#f0f2f7', margin: 0, marginBottom: 8,
                }}>
                  {bookTitle || bookSlug.toUpperCase()}
                </h1>
                {!isLoading && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { icon: <Layers size={13} />, label: `${totalChapters} chapters`, color: '#4f8ef7' },
                      { icon: <BookOpen size={13} />, label: `${classCount} class${classCount !== 1 ? 'es' : ''}`, color: '#8b5cf6' },
                    ].map((tag, i) => (
                      <div key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 12px', borderRadius: 100,
                        background: `${tag.color}15`,
                        border: `1px solid ${tag.color}30`,
                        color: tag.color, fontSize: 12, fontWeight: 600,
                      }}>
                        {tag.icon} {tag.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </>
  );
}
