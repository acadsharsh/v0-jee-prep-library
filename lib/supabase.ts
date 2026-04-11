import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize client only if environment variables are available
export const supabase = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper for routes that require supabase
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not initialized. Check environment variables.');
  }
  return supabase;
}

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          slug: string;
          title: string;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          cover_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          cover_image_url?: string | null;
          created_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          class_identifier: string;
          chapter_number: number;
          title: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          class_identifier: string;
          chapter_number: number;
          title: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          class_identifier?: string;
          chapter_number?: number;
          title?: string;
          slug?: string;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          chapter_id: string;
          json_blob_url: string;
          difficulty: string | null;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          json_blob_url: string;
          difficulty?: string | null;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          json_blob_url?: string;
          difficulty?: string | null;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          time_taken_seconds: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          time_taken_seconds?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          time_taken_seconds?: number | null;
          completed_at?: string;
        };
      };
    };
  };
};
