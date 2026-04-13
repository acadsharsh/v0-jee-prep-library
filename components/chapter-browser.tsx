'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';

interface ChapterBrowserProps { chapters:{[classId:string]:Chapter[]}; bookSlug:string; isLoading:boolean; }

const COLORS: Record<string,string> = { '11':'#f5d90a', '12':'#ff7a00', 'common':'#0fd68a', '11_and_12':'#3d9eff' };
const LABELS: Record<string,string> = { '11':'Class XI', '12':'Class XII', 'common':'Common', '11_and_12':'XI & XII' };

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {[...Array(6)].map((_,i)=><div key={i} style={{height:54,background:'#fafafa',border:'3px solid #eee'}}/>)}
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:28}}>
      {Object.entries(chapters).map(([classId, classChapters])=>{
        const color = COLORS[classId]??'#f5d90a';
        const label = LABELS[classId]??classId;
        return (
          <div key={classId}>
            {/* Class header */}
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{background:color,border:'3px solid #0a0a0a',padding:'4px 14px',fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#0a0a0a'}}>
                {label}
              </div>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700,color:'#999'}}>
                {classChapters.length} CHAPTERS
              </div>
            </div>

            {/* Chapter rows */}
            <div style={{border:'3px solid #0a0a0a',boxShadow:'4px 4px 0 #0a0a0a',overflow:'hidden'}}>
              {classChapters.sort((a,b)=>a.chapter_number-b.chapter_number).map((ch,idx,arr)=>(
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div className="neo-chap-row" style={{borderBottom:idx<arr.length-1?'2px solid #e8e8e8':'none'}}>
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                      <div className="neo-chap-num">{String(ch.chapter_number).padStart(2,'0')}</div>
                      <span style={{fontSize:14,fontWeight:600}}>{ch.title}</span>
                    </div>
                    <span className="chap-arrow">→</span>
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
