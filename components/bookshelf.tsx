'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';
import { BookOpen, ChevronRight } from 'lucide-react';

interface BookshelfProps { books: Book[]; isLoading: boolean; }

const SUBJECT_COLORS: Record<string, string> = {
  physics:   '#5b8ef0',
  chemistry: '#4caf7d',
  maths:     '#c97af0',
  math:      '#c97af0',
  default:   '#e8824a',
};

function getColor(title: string) {
  const t = title.toLowerCase();
  for (const k of Object.keys(SUBJECT_COLORS)) {
    if (t.includes(k)) return SUBJECT_COLORS[k];
  }
  return SUBJECT_COLORS.default;
}

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            height: 52, borderBottom: '1px solid var(--border)',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
          }} />
        ))}
      </div>
    );
  }

  if (!books.length) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx-3)', fontSize: 13 }}>
        <BookOpen size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
        No books available yet
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--bg-1)',
    }}>
      {books.map((book, idx) => {
        const color = getColor(book.title);
        return (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <div
              className="row-item"
              style={{
                borderBottom: idx < books.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 14,
              }}
            >
              {/* Color dot */}
              <div style={{
                width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={14} color={color} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--tx-1)' }}>
                  {book.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 1 }}>
                  Chapter-wise quizzes
                </div>
              </div>

              <ChevronRight size={14} color="var(--tx-3)" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
