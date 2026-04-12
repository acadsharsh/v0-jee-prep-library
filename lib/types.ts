export interface QuizOption {
  id: string;
  text: string;
}

export type QuestionType = 'mcq' | 'msq' | 'numerical';

export interface QuizQuestion {
  id: string;
  type?: QuestionType; // defaults to 'mcq' if missing
  questionText: string;
  options?: QuizOption[];           // mcq/msq
  correctOptionId?: string;         // mcq only
  correctOptionIds?: string[];      // msq — multiple correct
  correctAnswer?: number;           // numerical
  tolerance?: number;               // numerical tolerance ±
  explanation?: string;
}

export interface QuizJSON {
  book_slug: string;
  book_title: string;
  class_identifier: string;
  chapter_number: number;
  chapter_title: string;
  quiz_title: string;
  quiz_description?: string;
  difficulty?: string;
  questions: QuizQuestion[];
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  class_identifier: string;
  chapter_number: number;
  title: string;
  slug: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  chapter_id: string;
  json_blob_url: string;
  difficulty: string | null;
  title: string;
  description: string | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  time_taken_seconds: number | null;
  completed_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  role: string;
  created_at: string;
}
