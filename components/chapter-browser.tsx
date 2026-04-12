'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  '11':        { label: 'Class XI',  bg: '#EDE9FE', color: '#7C3AED' },
  '12':        { label: 'Class XII', bg: '#FEF9C3', color: '#CA8A04' },
  'common':    { label: 'Common',    bg: '#D1FAE5', color: '#059669' },
  '11_and_12': { label: 'XI & XII',  bg: '#DBEAFE', color: '#2563EB' },
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 58, borderRadius: 14, background: '#F2F4F8' }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const cfg = CLASS_CFG[classId] ?? { label: classId, bg: '#EDE9FE', color: '#7C3AED' };
        return (
          <div key={classId}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ padding: '5px 16px', borderRadius: 100, background: cfg.bg }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Nunito, sans-serif' }}>{cfg.label}</span>
              </div>
              <span style={{ fontSize: 12, color: '#7C8DB0', fontWeight: 700 }}>{classChapters.length} chapters</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {classChapters.sort((a, b) => a.chapter_number - b.chapter_number).map((ch) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    borderRadius: 14, background: '#FFFFFF', border: '1.5px solid #E8EAF0',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = cfg.bg; el.style.borderColor = cfg.color + '50'; el.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = '#FFFFFF'; el.style.borderColor = '#E8EAF0'; el.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: cfg.color }}>
                      {String(ch.chapter_number).padStart(2, '0')}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>{ch.title}</span>
                    <ChevronRight size={16} color="#B4BAD4" />
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
