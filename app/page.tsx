'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Bookshelf } from '@/components/bookshelf';
import { Book } from '@/lib/types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Your Digital Physics Library
            </h1>
            <p className="text-xl text-muted-foreground text-balance">
              Master JEE Physics with chapter-wise quizzes from your favorite textbooks. Track your progress, compete on leaderboards, and build confidence.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-8">Available Books</h2>
            <Bookshelf books={books} isLoading={isLoading} />
          </section>
        </div>
      </main>
    </>
  );
}
