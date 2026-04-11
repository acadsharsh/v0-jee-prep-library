'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Bookshelf } from '@/components/bookshelf';
import { Book } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance text-slate-900">
              Master JEE Physics
            </h1>
            <p className="text-xl text-slate-600 text-balance max-w-3xl mb-8">
              Interactive chapter-wise quizzes from HCV, Irodov, and more. Track your progress, build confidence, and excel in your JEE preparation.
            </p>
            {!authLoading && !user && (
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/books/hcv')}
                >
                  Browse Quizzes
                </Button>
              </div>
            )}
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-slate-900">Available Books</h2>
            <Bookshelf books={books} isLoading={isLoading} />
          </section>

          {user && (
            <section className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Quick Stats</h2>
              <p className="text-slate-600">
                Welcome back! Visit your <Button 
                  variant="link" 
                  className="text-blue-600 hover:text-blue-700 h-auto p-0"
                  onClick={() => router.push('/dashboard')}
                >
                  dashboard
                </Button> to see your progress and performance analytics.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
