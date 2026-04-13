'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_LABELS: Record<string,string> = { '11':'Class XI', '12':'Class XII', 'common':'Common', '11_and_12':'XI & XII' };
const CLASS_COLORS: Record<string,string> = { '11':'#7C6FF7', '12':'#FF6B35', 'common':'#22C55E', '11_and_12':'#3B82F6' };

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div>
      {[...Array(5)].map((_,i) => <div key={i} style={{ height:54,borderRadius:12,background:'var(--bg)',marginBottom:8 }} />)}
    </div>
  );

  const allChapters = Object.entries(chapters);

  return (
    <div>
      {allChapters.map(([classId, classChapters]) => {
        const color = CLASS_COLORS[classId] ?? '#7C6FF7';
        const label = CLASS_LABELS[classId] ?? classId;
        return (
          <div key={classId} style={{ marginBottom:32 }}>
            {/* Class header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--bd)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff' }}>
                  {label.slice(0,1)}
                </div>
                <span style={{ fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700 }}>{label}</span>
                <span style={{ fontSize:11,color:'var(--mu)',background:'var(--bg)',padding:'2px 9px',borderRadius:100,fontWeight:600 }}>
                  {classChapters.length} chapters
                </span>
              </div>
              <span style={{ fontSize:12,color:'var(--mu)' }}>Showing all ({classChapters.length})</span>
            </div>

            {/* Chapter rows — image 1 style */}
            <div style={{ background:'#fff',borderRadius:'var(--r)',border:'1.5px solid var(--bd)',overflow:'hidden' }}>
              {classChapters.sort((a,b) => a.chapter_number - b.chapter_number).map((ch, idx, arr) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'16px 20px',
                    borderBottom: idx < arr.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    cursor:'pointer',transition:'background .12s',
                  }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(124,111,247,.04)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}
                  >
                    <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                      {/* Chapter icon */}
                      <div style={{ width:36,height:36,borderRadius:10,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color,fontFamily:'Syne,sans-serif',flexShrink:0 }}>
                        {String(ch.chapter_number).padStart(2,'0')}
                      </div>
                      <span style={{ fontSize:14,fontWeight:600,color:'var(--tx)' }}>{ch.title}</span>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:16 }}>
                      <span style={{ fontSize:12,color:'var(--mu)' }}>Practice →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
