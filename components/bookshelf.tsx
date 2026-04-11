'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';
import { BookOpen, ChevronRight } from 'lucide-react';

interface BookshelfProps {
  books: Book[];
  isLoading: boolean;
}

const BOOK_COLORS = [
  { from: '#4f8ef7', to: '#8b5cf6' },
  { from: '#22c55e', to: '#4f8ef7' },
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#8b5cf6', to: '#ec4899' },
  { from: '#06b6d4', to: '#22c55e' },
];

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            height: 280, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '80px 24px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <BookOpen size={40} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#8b92a5', fontSize: 15 }}>No books available yet</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {books.map((book, idx) => {
        const colors = BOOK_COLORS[idx % BOOK_COLORS.length];
        return (
          <Link key={book.id} href={`/books/${book.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              background: 'var(--bg-surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(.22,.68,0,1.2)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = 'rgba(255,255,255,0.14)';
                el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Cover */}
              <div style={{
                height: 200,
                background: book.cover_image_url
                  ? undefined
                  : `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={26} color="rgba(255,255,255,0.9)" />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                      textAlign: 'center', padding: '0 16px',
                      fontFamily: 'Syne, sans-serif',
                    }}>{book.title}</span>
                  </div>
                )}
                {/* Overlay gradient */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(17,19,24,0.8) 0%, transparent 50%)',
                }} />
              </div>

              {/* Footer */}
              <div style={{
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f7', fontFamily: 'Syne, sans-serif' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>
                    View chapters →
                  </div>
                </div>
                <ChevronRight size={16} color="#8b92a5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
