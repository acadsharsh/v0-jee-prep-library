'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ChapterBrowser } from '@/components/chapter-browser';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ChaptersData {
  [classId: string]: Array<{
    id: string;
    book_id: string;
    class_identifier: string;
    chapter_number: number;
    title: string;
    slug: string;
    created_at: string;
  }>;
}

export default function BookPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const [chapters, setChapters] = useState<ChaptersData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(`/api/books/${bookSlug}/chapters`);
        const data = await response.json();
        setChapters(data);

        // Fetch book title
        const booksResponse = await fetch('/api/books');
        const books = await booksResponse.json();
        const book = books.find((b: any) => b.slug === bookSlug);
        if (book) setBookTitle(book.title);
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [bookSlug]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">{bookTitle}</h1>
            <p className="text-muted-foreground">
              Select a class and chapter to start practicing
            </p>
          </div>

          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
