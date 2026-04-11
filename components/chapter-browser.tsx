'use client';

import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChapterBrowserProps {
  chapters: { [classId: string]: Chapter[] };
  bookSlug: string;
  isLoading: boolean;
}

export function ChapterBrowser({ chapters, bookSlug, isLoading }: ChapterBrowserProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            <div className="space-y-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const classNames: { [key: string]: string } = {
    '11': 'Class 11',
    '12': 'Class 12',
    'common': 'Common',
    '11_and_12': 'Class 11 & 12',
  };

  return (
    <div className="space-y-8">
      {Object.entries(chapters).map(([classId, classChapters]) => (
        <div key={classId}>
          <h2 className="text-2xl font-bold mb-4">{classNames[classId] || classId}</h2>
          <div className="grid gap-2">
            {classChapters
              .sort((a, b) => a.chapter_number - b.chapter_number)
              .map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/books/${bookSlug}/chapters/${chapter.slug}`}
                >
                  <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">Ch {chapter.chapter_number}</Badge>
                      <h3 className="font-semibold flex-1">{chapter.title}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
