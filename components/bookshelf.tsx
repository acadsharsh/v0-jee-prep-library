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
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No books available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.slug}`}>
          <Card className="h-64 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="h-full w-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-4">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-primary-foreground" />
                  <p className="font-semibold text-primary-foreground text-sm line-clamp-3">
                    {book.title}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
