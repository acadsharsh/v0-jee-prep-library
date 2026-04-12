'use client';
import Link from 'next/link';
import { Book } from '@/lib/types';

interface BookshelfProps { books: Book[]; isLoading: boolean; }

const STYLES = [
  { bg: '#FDE68A', text: '#92400E', icon: '⚡' },
  { bg: '#DDD6FE', text: '#4C1D95', icon: '🔬' },
  { bg: '#FBCFE8', text: '#831843', icon: '∑' },
  { bg: '#A7F3D0', text: '#064E3B', icon: '🧲' },
];

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {[...Array(4)].map((_, i) => <div key={i} style={{ height: 150, borderRadius: 18, background: '#F2F4F8' }} />)}
    </div>
  );
  if (!books.length) return <div style={{ padding: '48px', textAlign: 'center', borderRadius: 18, background: '#F2F4F8', color: '#7C8DB0', fontWeight: 800 }}>No books yet</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {books.map((book, idx) => {
        const s = STYLES[idx % STYLES.length];
        return (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <div className="book-tile" style={{ background: s.bg }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 44 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'Lilita One, cursive', fontSize: 16, color: s.text, lineHeight: 1.2, marginBottom: 4 }}>{book.title}</div>
                <div style={{ fontSize: 11, color: s.text, opacity: 0.65, fontWeight: 800 }}>View chapters →</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
