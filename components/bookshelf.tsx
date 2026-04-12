'use client';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { BookOpen } from 'lucide-react';

interface BookshelfProps { books: Book[]; isLoading: boolean; }

const COLORS = [
  { bg: '#fff3ee', accent: '#ff7d3b', icon: '⚡' },
  { bg: '#ede9fe', accent: '#7b6cf6', icon: '🔬' },
  { bg: '#d1fae5', accent: '#059669', icon: '∑' },
  { bg: '#fef9c3', accent: '#ca8a04', icon: '🧲' },
];

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 160, borderRadius: 16, background: '#f4f5fb' }} />
      ))}
    </div>
  );

  if (!books.length) return (
    <div style={{ padding: '60px', textAlign: 'center', borderRadius: 16, background: '#f4f5fb', color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>
      No books available yet
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {books.map((book, idx) => {
        const c = COLORS[idx % COLORS.length];
        return (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <div className="d-card" style={{
              background: c.bg, border: 'none',
              minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 36 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#1e1e2d', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>
                  {book.title}
                </div>
                <div style={{ fontSize: 12, color: c.accent, fontWeight: 800 }}>View chapters →</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
