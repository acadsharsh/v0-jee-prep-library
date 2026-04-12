'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  '11':        { label: 'Class XI',  bg: 'rgba(123,108,246,0.12)', color: '#7b6cf6',  border: 'rgba(123,108,246,0.25)' },
  '12':        { label: 'Class XII', bg: 'rgba(255,125,59,0.12)',  color: '#ff7d3b',  border: 'rgba(255,125,59,0.25)'  },
  'common':    { label: 'Common',    bg: 'rgba(52,211,153,0.12)',  color: '#34d399',  border: 'rgba(52,211,153,0.25)'  },
  '11_and_12': { label: 'XI & XII',  bg: 'rgba(245,200,66,0.12)',  color: '#f5c842',  border: 'rgba(245,200,66,0.25)'  },
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 56, borderRadius: 12, background: '#1a1c2e' }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const cfg = CLASS_CFG[classId] ?? { label: classId, bg: 'rgba(123,108,246,0.12)', color: '#7b6cf6', border: 'rgba(123,108,246,0.25)' };
        return (
          <div key={classId}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ padding: '4px 14px', borderRadius: 100, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
              </div>
              <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 700 }}>{classChapters.length} chapters</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {classChapters.sort((a, b) => a.chapter_number - b.chapter_number).map((ch) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: '#1a1c2e', border: '1px solid #2d3255', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = '#1e2235'; el.style.borderColor = cfg.border; el.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = '#1a1c2e'; el.style.borderColor = '#2d3255'; el.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: cfg.color, fontFamily: 'Space Mono, monospace' }}>
                      {String(ch.chapter_number).padStart(2, '0')}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{ch.title}</span>
                    <ChevronRight size={16} color="#4b5563" />
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
