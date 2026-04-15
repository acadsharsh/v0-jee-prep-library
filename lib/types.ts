export type QuestionType = 'mcq' | 'msq' | 'numerical';

export interface Option { id: string; text: string; imageUrl?: string; }

export interface QuizQuestion {
  id: string;
  type?: QuestionType;
  questionText: string;
  imageUrl?: string;         // ← URL or base64 for question diagram
  imageCaption?: string;     // optional caption below diagram
  options?: Option[];
  correctOptionId?: string;
  correctOptionIds?: string[];
  correctAnswer?: number;
  tolerance?: number;
  explanation?: string;
  explanationImageUrl?: string; // diagram for explanation
}

export interface QuizJSON {
  quiz_title: string;
  book_slug?: string;
  book_title?: string;
  class_identifier?: string;
  chapter_number?: number;
  chapter_title?: string;
  difficulty?: string;
  quiz_description?: string;
  questions: QuizQuestion[];
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  cover_image_url?: string | null;
  subject?: string;
  created_at?: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  class_identifier: string;
  chapter_number: number;
  title: string;
  slug: string;
  created_at?: string;
}
