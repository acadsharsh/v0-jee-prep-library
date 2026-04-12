'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ChapterBrowserProps { chapters:{ [classId:string]:Chapter[] }; bookSlug:string; isLoading:boolean; }

const CLASS_CFG: Record<string, { label:string; color:string; bg:string; border:string }> = {
  '11':        { label:'Class XI',  color:'#9B7FE8', bg:'rgba(155,127,232,0.1)', border:'rgba(155,127,232,0.2)' },
  '12':        { label:'Class XII', color:'#FF7D3B', bg:'rgba(255,125,59,0.1)',  border:'rgba(255,125,59,0.2)'  },
  'common':    { label:'Common',    color:'#4CAF7D', bg:'rgba(76,175,125,0.1)',  border:'rgba(76,175,125,0.2)'  },
  '11_and_12': { label:'XI & XII',  color:'#FFD23F', bg:'rgba(255,210,63,0.1)',  border:'rgba(255,210,63,0.2)'  },
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[...Array(6)].map((_,i) => <div key={i} style={{ height:58, borderRadius:12, background:'#141414', border:'1px solid rgba(255,255,255,0.06)' }} />)}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const cfg = CLASS_CFG[classId] ?? { label:classId, color:'#9B7FE8', bg:'rgba(155,127,232,0.1)', border:'rgba(155,127,232,0.2)' };
        return (
          <div key={classId}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ padding:'4px 14px', borderRadius:100, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                <span style={{ fontSize:11, fontWeight:800, color:cfg.color, textTransform:'uppercase', letterSpacing:'0.07em' }}>{cfg.label}</span>
              </div>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{classChapters.length} chapters</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {classChapters.sort((a,b) => a.chapter_number-b.chapter_number).map(ch => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:12, background:'#141414', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='#1a1a1a'; el.style.borderColor=cfg.border; el.style.transform='translateX(4px)'; }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='#141414'; el.style.borderColor='rgba(255,255,255,0.07)'; el.style.transform='translateX(0)'; }}
                  >
                    <div style={{ width:34, height:34, borderRadius:8, flexShrink:0, background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:cfg.color, fontFamily:'Space Grotesk,sans-serif' }}>
                      {String(ch.chapter_number).padStart(2,'0')}
                    </div>
                    <span style={{ flex:1, fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.85)' }}>{ch.title}</span>
                    <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
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
