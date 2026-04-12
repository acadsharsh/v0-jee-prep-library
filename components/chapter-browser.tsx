'use client';
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ChapterBrowserProps { chapters: { [classId: string]: Chapter[] }; bookSlug: string; isLoading: boolean; }

const CLASS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  '11':       { label: 'Class XI',    bg: '#fff3ee', color: '#ff7d3b' },
  '12':       { label: 'Class XII',   bg: '#ede9fe', color: '#7b6cf6' },
  'common':   { label: 'Common',      bg: '#d1fae5', color: '#059669' },
  '11_and_12':{ label: 'XI & XII',    bg: '#fef9c3', color: '#ca8a04' },
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 56, borderRadius: 12, background: '#f4f5fb' }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => {
        const cfg = CLASS_CFG[classId] ?? { label: classId, bg: '#f4f5fb', color: '#7b6cf6' };
        return (
          <div key={classId}>
            {/* Class header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ padding: '4px 14px', borderRadius: 100, background: cfg.bg }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {cfg.label}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{classChapters.length} chapters</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {classChapters.sort((a, b) => a.chapter_number - b.chapter_number).map((ch) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 12,
                    background: '#ffffff', border: '1px solid #e8e8f0',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = cfg.bg; el.style.borderColor = cfg.color + '40'; el.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = '#ffffff'; el.style.borderColor = '#e8e8f0'; el.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: cfg.color,
                      fontFamily: 'Space Mono, monospace',
                    }}>
                      {String(ch.chapter_number).padStart(2, '0')}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1e1e2d' }}>{ch.title}</span>
                    <ChevronRight size={16} color="#9ca3af" />
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
