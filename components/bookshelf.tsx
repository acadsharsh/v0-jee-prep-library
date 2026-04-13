'use client';
import Link from 'next/link';
import { Book } from '@/lib/types';

interface BookshelfProps { books: Book[]; isLoading: boolean; }

const BCOLORS: Record<string,string> = { hcv:'#7C6FF7', irodov:'#FF6B35', ncert:'#22C55E', dc:'#3B82F6', sl:'#EC4899', vk:'#EF4444', ms:'#8B5CF6', cengage:'#F59E0B' };
const BSHORT: Record<string,string> = { hcv:'HCV', irodov:'IRD', ncert:'NCRT', dc:'DCP', sl:'SL', vk:'VKJ', ms:'MSC', cengage:'CNG' };
function bColor(slug: string) { for (const k of Object.keys(BCOLORS)) { if (slug.toLowerCase().includes(k)) return BCOLORS[k]; } return '#7C6FF7'; }
function bShort(title: string) { for (const k of Object.keys(BSHORT)) { if (title.toLowerCase().includes(k)) return BSHORT[k]; } return title.slice(0,3).toUpperCase(); }

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) return (
    <div className="bcards">
      {[...Array(4)].map((_,i) => <div key={i} style={{ height:150, borderRadius:'var(--r)', background:'var(--bg)' }} />)}
    </div>
  );
  if (!books.length) return <div style={{ fontSize:13, color:'var(--mu)', padding:'16px 0' }}>No books available yet.</div>;

  return (
    <div className="bcards">
      {books.map(b => (
        <Link key={b.id} href={`/books/${b.slug}`}>
          <div className="btile">
            <div className="bspine" style={{ background: bColor(b.slug) }}>{bShort(b.title)}</div>
            <div className="bname">{b.title}</div>
            <div className="bsublbl">Chapter-wise practice</div>
            <div className="bcnt">Practice →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
