'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface BookshelfProps {
  books: Book[];
  isLoading: boolean;
}

export function Bookshelf({ books, isLoading }: BookshelfProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-400 text-lg">No books available yet</p>
      </div>
    );
  }

  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-teal-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-blue-500',
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book, idx) => (
        <Link key={book.id} href={`/books/${book.slug}`}>
          <div className="group relative h-64">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300`}></div>
            <Card className="relative h-64 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-slate-600 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className={`h-full w-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center relative group/inner`}>
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover/inner:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center px-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-white" />
                    <p className="font-bold text-white text-sm line-clamp-3">
                      {book.title}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover/inner:bg-black/20 transition-colors duration-300" />
              </div>
            </Card>
          </div>
        </Link>
      ))}
    </div>
  );
}
