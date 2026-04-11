'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  answers: Record<string, string>;
}

interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good job! Keep practicing.';
    return 'Keep studying and try again!';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-xl mt-2 text-slate-600">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
            <p className="text-lg font-semibold mt-4 text-slate-700">
              {getScoreMessage()}
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
            <Button onClick={onHome} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
