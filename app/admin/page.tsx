'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // Parse JSON to validate
      const parsed = JSON.parse(quizJson);

      const response = await fetch('/api/admin/upload-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizJson: parsed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload quiz');
      }

      setResult({
        type: 'success',
        message: data.message || 'Quiz uploaded successfully!',
      });
      setQuizJson('');
      toast({
        title: 'Success',
        description: data.message,
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'Failed to upload quiz',
      });
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuiz = {
    book_slug: 'hcv',
    book_title: 'Concepts of Physics',
    class_identifier: '11',
    chapter_number: 7,
    chapter_title: 'Circular Motion',
    quiz_title: 'Circular Motion - Exercises',
    quiz_description: 'A set of practice questions covering the exercises from HCV chapter on Circular Motion.',
    difficulty: 'Medium',
    questions: [
      {
        id: 'q1',
        questionText: 'A particle moves in a circle of radius R. In half the period of revolution, what is its displacement?',
        options: [
          { id: 'opt1', text: '2πR' },
          { id: 'opt2', text: 'πR' },
          { id: 'opt3', text: '2R' },
          { id: 'opt4', text: '0' },
        ],
        correctOptionId: 'opt3',
        explanation: 'In half a revolution, the particle moves from one point on the circle to the diametrically opposite point. The distance between these two points is the diameter, which is 2R.',
      },
    ],
  };

  return (
    <>
      <Navigation isAdmin={true} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Upload new quizzes using the JSON format below
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Quiz JSON Content</label>
                  <Textarea
                    value={quizJson}
                    onChange={(e) => setQuizJson(e.target.value)}
                    placeholder="Paste your quiz JSON here..."
                    className="min-h-96 font-mono text-sm"
                  />
                </div>

                <Button type="submit" disabled={isLoading || !quizJson} className="w-full">
                  {isLoading ? 'Publishing...' : 'Publish Quiz'}
                </Button>

                {result && (
                  <Alert variant={result.type === 'success' ? 'default' : 'destructive'}>
                    {result.type === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{result.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}
              </form>
            </Card>

            {/* Example */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Example Quiz JSON</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Copy and modify this structure to create your quizzes:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
                {JSON.stringify(exampleQuiz, null, 2)}
              </pre>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
