'use client';

import { useState, useEffect } from 'react';
import { QuizJSON, MCQQuestion, NumericalQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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

  const handleNumericalAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
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

  const isMCQ = (q: any): q is MCQQuestion => q.type === 'mcq' || q.options;
  const isNumerical = (q: any): q is NumericalQuestion => q.type === 'numerical';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
            {quiz.quiz_title}
          </h1>
          <Badge 
            className={`text-lg font-bold px-4 py-2 rounded-full ${
              timeRemaining > 300 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
            }`}
          >
            ⏱ {formatTime(timeRemaining)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-400 font-semibold">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
            <p className="text-slate-400 text-sm">{Math.round(progress)}% Complete</p>
          </div>
          <div className="bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
            <Progress value={progress} className="h-3 bg-slate-700/50" />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
          <Card className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                isMCQ(question) 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-br from-orange-500 to-red-500'
              }`}>
                {isMCQ(question) ? '📝' : '🔢'}
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                {isMCQ(question) ? 'Multiple Choice' : 'Numerical Type'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
              {question.questionText}
            </h2>

            {isMCQ(question) ? (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerSelect(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 group/option">
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id}
                        className="border-2 border-slate-600 group-hover/option:border-blue-400 transition-colors"
                      />
                      <Label 
                        htmlFor={option.id} 
                        className="cursor-pointer flex-1 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800 hover:border-blue-500/50 transition-all group-hover/option:text-blue-300 text-white"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Enter your answer"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleNumericalAnswer(question.id, e.target.value)}
                    className="bg-slate-800/50 border border-slate-700/50 text-white text-lg p-4 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    step="0.01"
                  />
                  {(question as NumericalQuestion).unit && (
                    <div className="flex items-center justify-center px-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white font-semibold">
                      {(question as NumericalQuestion).unit}
                    </div>
                  )}
                </div>
                <p className="text-slate-400 text-sm">
                  Tolerance: ± {(question as NumericalQuestion).tolerance}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-full font-bold disabled:opacity-50"
            variant="outline"
          >
            ← Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  idx === currentQuestion
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                    : answers[q.id]
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
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
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-2 rounded-full font-bold disabled:opacity-50"
            >
              {isSubmitting ? '⏳ Submitting...' : '✓ Submit Quiz'}
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-bold"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
