'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  '11':        { label: 'Class XI',   color: 'var(--yellow)',  bg: 'rgba(245,200,66,0.1)' },
  '12':        { label: 'Class XII',  color: 'var(--orange)',  bg: 'rgba(251,146,60,0.1)' },
  'common':    { label: 'Common',     color: 'var(--lime)',    bg: 'rgba(74,222,128,0.1)' },
  '11_and_12': { label: 'XI & XII',   color: 'var(--sky)',     bg: 'rgba(96,165,250,0.1)' },
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 56, borderRadius: 'var(--r-lg)', background: 'var(--surface)' }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const cfg = CLASS_CFG[classId] ?? { label: classId, color: 'var(--yellow)', bg: 'rgba(245,200,66,0.1)' };
        return (
          <div key={classId}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, fontSize: 11, padding: '4px 12px' }}>{cfg.label}</span>
              <span style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 600 }}>{classChapters.length} chapters</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {classChapters.sort((a, b) => a.chapter_number - b.chapter_number).map(ch => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = cfg.color + '40'; el.style.background = cfg.bg; el.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--surface)'; el.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: cfg.bg, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                      {String(ch.chapter_number).padStart(2, '0')}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{ch.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--faint)' }}>→</span>
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
