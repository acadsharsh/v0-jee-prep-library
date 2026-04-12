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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Hero Section */}
          <div className="mb-20 text-center">
            <div className="inline-block mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-2xl">
                <p className="text-white font-bold text-lg">Master JEE Physics</p>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 text-balance text-white leading-tight">
              Create Your <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Perfect Physics</span>
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Learning Journey</span>
            </h1>
            <p className="text-xl text-slate-300 text-balance max-w-3xl mx-auto mb-12">
              Interactive chapter-wise quizzes with multiple question types. Track your progress and master JEE physics with confidence.
            </p>
            {!authLoading && !user && (
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/books')}
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full"
                >
                  Browse Quizzes
                </Button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-black mb-12 text-center text-white">Why Choose Our Platform</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* MCQ Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-2xl">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Multiple Choice</h3>
                  <p className="text-gray-800 text-sm">Choose from multiple options with instant feedback</p>
                </div>
              </div>

              {/* Numerical Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-400 to-blue-500 p-8 rounded-2xl">
                  <div className="text-5xl mb-4">🔢</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Numerical Type</h3>
                  <p className="text-white/90 text-sm">Solve numerical problems and test your calculation skills</p>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-pink-400 to-red-500 p-8 rounded-2xl">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
                  <p className="text-white/90 text-sm">Visualize your performance and identify weak areas</p>
                </div>
              </div>
            </div>
          </section>

          {/* Books Section */}
          <section className="mb-16">
            <h2 className="text-4xl font-black mb-12 text-center text-white">Available Books</h2>
            <Bookshelf books={books} isLoading={isLoading} />
          </section>

          {/* CTA Section */}
          {user && (
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-4 text-white">Welcome Back, Scholar!</h2>
              <p className="text-blue-100 mb-6">
                Continue your learning journey and see how much you&apos;ve progressed.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 py-3 rounded-full"
              >
                Go to Dashboard
              </Button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
