'use client';

import { useState, useEffect } from 'react';
import { QuizJSON } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QuizInterfaceProps {
  quiz: QuizJSON;
  quizId: string;
  onSubmit: (answers: { [key: string]: string }, timeTaken: number) => Promise<void>;
}

export function QuizInterface({ quiz, quizId, onSubmit }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.questions.length * 2 * 60); // 2 min per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      await onSubmit(answers, timeTaken);
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{quiz.quiz_title}</h1>
          <Badge variant={timeRemaining > 300 ? 'default' : 'destructive'}>
            Time: {formatTime(timeRemaining)}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      {/* Question */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">{question.questionText}</h2>

        <RadioGroup
          value={answers[question.id] || ''}
          onValueChange={(value) => handleAnswerSelect(question.id, value)}
        >
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {quiz.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-10 h-10 rounded border ${
                idx === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : answers[q.id]
                  ? 'bg-accent'
                  : 'border-border'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
