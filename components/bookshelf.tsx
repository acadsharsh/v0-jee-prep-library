'use client';
import Link from 'next/link';
import { Book } from '@/lib/types';

interface BookshelfProps { books:Book[]; isLoading:boolean; }

const BCOLORS: Record<string,string> = { hcv:'#f5d90a', irodov:'#ff7a00', ncert:'#0fd68a', dc:'#3d9eff', sl:'#ff6fd8', vk:'#ff4d4d', ms:'#b06ef3', cengage:'#b8f72b' };
function bColor(slug:string){for(const k of Object.keys(BCOLORS)){if(slug.toLowerCase().includes(k))return BCOLORS[k];}return'#f5d90a';}
function bShort(title:string){const m: Record<string,string>={hcv:'HCV',irodov:'IRD',ncert:'NCRT',dc:'DCP',sl:'SL',vk:'VKJ',ms:'MSC',cengage:'CNG'};for(const k of Object.keys(m)){if(title.toLowerCase().includes(k))return m[k];}return title.slice(0,3).toUpperCase();}

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if(isLoading)return(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>{[...Array(4)].map((_,i)=><div key={i} style={{height:150,background:'#fafafa',border:'3px solid #eee'}}/>)}</div>);
  if(!books.length)return(<div style={{background:'#fafafa',border:'3px solid #0a0a0a',padding:32,textAlign:'center',fontWeight:700,color:'#666'}}>No books yet</div>);

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
      {books.map(b=>(
        <Link key={b.id} href={`/books/${b.slug}`}>
          <div className="neo-book-tile">
            <div className="neo-book-spine" style={{background:bColor(b.slug)}}>{bShort(b.title)}</div>
            <div className="neo-book-name">{b.title}</div>
            <div className="neo-book-sub">Chapter practice</div>
            <div className="neo-book-tag">Practice →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
