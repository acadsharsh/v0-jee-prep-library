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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapterQuizzes = async () => {
      try {
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

        // Fetch quiz by chapter_id
        const quizResponse = await fetch(`/api/quizzes/${chapterId}`);

        if (!quizResponse.ok) {
          const errData = await quizResponse.json();
          throw new Error(errData.error || 'Failed to fetch quiz');
        }

        const quizData = await quizResponse.json();

        // ✅ Actually set the quiz state
        setQuiz({
          id: quizData.id,
          content: quizData.content,
        });
      } catch (err: any) {
        console.error('Failed to fetch quiz:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterQuizzes();
  }, [bookSlug, chapterSlug]);

  const handleQuizSubmit = async (answers: { [key: string]: string }, timeTaken: number) => {
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz?.id, answers, timeTaken }),
      });
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
              {error && (
                <p className="text-sm text-red-500 mb-2">{error}</p>
              )}
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
