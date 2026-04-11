'use client';
import Link from 'next/link';
import { Book } from '@/lib/types';

interface BookshelfProps { books: Book[]; isLoading: boolean; }

const ACCENTS = ['var(--lime)', 'var(--mint)', 'var(--yellow)', '#ff7eb3', '#7eb3ff'];

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:0, border:'1.5px solid var(--dim)' }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height:160, borderRight:'1.5px solid var(--dim)', background:'var(--black-2)', borderBottom:'none' }} />
      ))}
    </div>
  );

  if (!books.length) return (
    <div style={{ padding:'60px 0', textAlign:'center', border:'1.5px solid var(--dim)', color:'var(--muted)', fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em' }}>
      No books yet
    </div>
  );

  return (
    <div style={{ border:'1.5px solid var(--dim)', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))' }}>
      {books.map((book, idx) => {
        const accent = ACCENTS[idx % ACCENTS.length];
        return (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <div style={{
              padding:'28px 24px',
              borderRight: '1.5px solid var(--dim)',
              borderBottom: '1.5px solid var(--dim)',
              cursor:'pointer',
              transition:'background 0.12s',
              minHeight:160,
              display:'flex', flexDirection:'column', justifyContent:'space-between',
              position:'relative', overflow:'hidden',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--black-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {/* Accent line top */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent }} />

              <div>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:accent, marginBottom:10 }}>
                  Book {idx + 1}
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--white)', lineHeight:1.25, letterSpacing:'-0.3px' }}>
                  {book.title}
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20 }}>
                <span style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  View chapters
                </span>
                <span style={{ color:accent, fontSize:18 }}>→</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
