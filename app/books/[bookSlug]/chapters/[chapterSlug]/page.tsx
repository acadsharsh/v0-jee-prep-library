'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { QuizJSON } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizData {
  id: string;
  content: QuizJSON;
}

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChapterQuizzes = async () => {
      try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const book = books.find((b: any) => b.slug === bookSlug);

        if (!book) throw new Error('Book not found');

        // Fetch chapters for this book to find the chapter ID
        const chaptersResponse = await fetch(`/api/books/${bookSlug}/chapters`);
        const chapters = await chaptersResponse.json();

        // Find the chapter by slug across all classes
        let chapterId: string | null = null;
        for (const classChapters of Object.values(chapters)) {
          const found = (classChapters as any[]).find((ch) => ch.slug === chapterSlug);
          if (found) {
            chapterId = found.id;
            break;
          }
        }

        if (!chapterId) throw new Error('Chapter not found');

        // For now, we'll fetch the first quiz for this chapter
        // In production, you'd get all quizzes and let user choose, or combine them
        const quizzesResponse = await fetch(
          `/api/quizzes/${chapterId}?chapter_id=${chapterId}`
        );
        // This is a simplified version - in production you'd have an endpoint to get quizzes by chapter
        // For now, we'll just navigate to a "no quiz yet" state
        setQuiz(null);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterQuizzes();
  }, [bookSlug, chapterSlug]);

  const handleQuizSubmit = async (answers: { [key: string]: string }, timeTaken: number) => {
    try {
      // In a real app, you'd calculate the score here
      // and submit it to the API
      alert('Quiz submitted! (Demo mode)');
      router.push(`/books/${bookSlug}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Link href={`/books/${bookSlug}`}>
            <Button variant="ghost" size="sm" className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>
          </Link>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading quiz...</p>
            </div>
          ) : quiz ? (
            <QuizInterface quiz={quiz.content} quizId={quiz.id} onSubmit={handleQuizSubmit} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No quiz available for this chapter yet.</p>
              <p className="text-sm text-muted-foreground">
                Check back soon or visit another chapter!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
