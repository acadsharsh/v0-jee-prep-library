'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_LABELS: Record<string,string> = { '11':'Class XI', '12':'Class XII', 'common':'Common', '11_and_12':'XI & XII' };
const CLASS_COLORS: Record<string,string> = { '11':'var(--lime)', '12':'var(--mint)', 'common':'var(--yellow)', '11_and_12':'#ff7eb3' };

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ border:'1.5px solid var(--dim)' }}>
      {[...Array(6)].map((_,i) => <div key={i} style={{ height:52, borderBottom:'1.5px solid var(--dim)' }} />)}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const accent = CLASS_COLORS[classId] ?? 'var(--lime)';
        return (
          <div key={classId}>
            {/* Class header */}
            <div style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'10px 0', marginBottom:0,
              borderBottom:'1.5px solid var(--dim)',
            }}>
              <div style={{ width:4, height:18, background:accent, flexShrink:0 }} />
              <span style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:accent }}>
                {CLASS_LABELS[classId] || classId}
              </span>
              <span style={{ fontSize:12, color:'var(--muted)' }}>— {classChapters.length} chapters</span>
            </div>

            <div style={{ border:'1.5px solid var(--dim)', borderTop:'none' }}>
              {classChapters.sort((a,b) => a.chapter_number - b.chapter_number).map((ch, idx) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div className="row-item" style={{ borderBottom: idx < classChapters.length-1 ? '1.5px solid var(--dim)' : 'none' }}>
                    <span style={{ fontFamily:'Space Mono, monospace', fontSize:12, color:'var(--muted)', minWidth:30 }}>
                      {String(ch.chapter_number).padStart(2,'0')}
                    </span>
                    <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{ch.title}</span>
                    <span style={{ color:accent, fontSize:16 }}>→</span>
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
