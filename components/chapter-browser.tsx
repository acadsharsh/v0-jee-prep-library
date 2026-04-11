'use client';

import Link from 'next/link';
import { Chapter } from '@/lib/types';

interface ChapterBrowserProps {
  chapters: { [classId: string]: Chapter[] };
  bookSlug: string;
  isLoading: boolean;
}

const classLabels: Record<string, string> = {
  '11': 'Class XI',
  '12': 'Class XII',
  'common': 'Common',
  '11_and_12': 'Class XI & XII',
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <div style={{ width: 120, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.04)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(5)].map((_, j) => (
                <div key={j} style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const classColors: Record<string, string> = { '11': '#4f8ef7', '12': '#8b5cf6', 'common': '#22c55e', '11_and_12': '#f59e0b' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => (
        <div key={classId}>
          {/* Class header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 3, height: 20, borderRadius: 2,
              background: classColors[classId] ?? '#4f8ef7',
            }} />
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 18, color: '#f0f2f7', margin: 0,
              letterSpacing: '-0.3px',
            }}>
              {classLabels[classId] || classId}
            </h2>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              borderRadius: 100,
              background: `${classColors[classId] ?? '#4f8ef7'}18`,
              color: classColors[classId] ?? '#4f8ef7',
            }}>
              {classChapters.length} chapters
            </span>
          </div>

          {/* Chapter list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 8 }}>
            {classChapters
              .sort((a, b) => a.chapter_number - b.chapter_number)
              .map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/books/${bookSlug}/chapters/${chapter.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    borderRadius: 11,
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'var(--bg-elevated)';
                      el.style.borderColor = 'rgba(255,255,255,0.1)';
                      el.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'var(--bg-surface)';
                      el.style.borderColor = 'rgba(255,255,255,0.05)';
                      el.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${classColors[classId] ?? '#4f8ef7'}15`,
                      border: `1px solid ${classColors[classId] ?? '#4f8ef7'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: classColors[classId] ?? '#4f8ef7',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {chapter.chapter_number}
                    </div>
                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: 600,
                      color: '#d0d4e0', fontFamily: 'Syne, sans-serif',
                    }}>
                      {chapter.title}
                    </span>
                    <span style={{ fontSize: 16, color: '#4a5168' }}>›</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
