'use client';

import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ChapterBrowserProps {
  chapters: { [classId: string]: Chapter[] };
  bookSlug: string;
  isLoading: boolean;
}

const CLASS_LABELS: Record<string, string> = {
  '11': 'Class XI',
  '12': 'Class XII',
  'common': 'Common',
  '11_and_12': 'Class XI & XII',
};

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) {
    return (
      <div>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ height: 50, borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(chapters).map(([classId, classChapters]) => (
        <div key={classId}>
          {/* Class label */}
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--tx-3)',
            padding: '0 0 10px',
            borderBottom: '1px solid var(--border)',
            marginBottom: 0,
          }}>
            {CLASS_LABELS[classId] || classId}
            <span style={{ marginLeft: 8, color: 'var(--bg-4)', fontWeight: 500 }}>
              {classChapters.length} chapters
            </span>
          </div>

          <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', background: 'var(--bg-1)' }}>
            {classChapters
              .sort((a, b) => a.chapter_number - b.chapter_number)
              .map((ch, idx) => (
                <Link key={ch.id} href={`/books/${bookSlug}/chapters/${ch.slug}`}>
                  <div
                    className="row-item"
                    style={{
                      borderBottom: idx < classChapters.length - 1 ? '1px solid var(--border)' : 'none',
                      gap: 14,
                    }}
                  >
                    {/* Chapter number */}
                    <span style={{
                      minWidth: 28, fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--tx-3)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {String(ch.chapter_number).padStart(2, '0')}
                    </span>

                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--tx-1)' }}>
                      {ch.title}
                    </span>

                    <ChevronRight size={13} color="var(--tx-3)" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
