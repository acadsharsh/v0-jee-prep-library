-- Fix RLS policies for books (allow admins to insert/update)
DROP POLICY IF EXISTS "Books are publicly readable" ON books;
CREATE POLICY "Books are publicly readable" ON books FOR SELECT USING (true);
CREATE POLICY "Admins can insert books" ON books FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update books" ON books FOR UPDATE WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fix RLS policies for chapters (allow admins to insert/update)
DROP POLICY IF EXISTS "Chapters are publicly readable" ON chapters;
CREATE POLICY "Chapters are publicly readable" ON chapters FOR SELECT USING (true);
CREATE POLICY "Admins can insert chapters" ON chapters FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update chapters" ON chapters FOR UPDATE WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fix RLS policies for quizzes (allow admins to insert/update)
DROP POLICY IF EXISTS "Quizzes are publicly readable" ON quizzes;
CREATE POLICY "Quizzes are publicly readable" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can insert quizzes" ON quizzes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update quizzes" ON quizzes FOR UPDATE WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Update quiz_attempts table to add score_percentage column if it doesn't exist
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS score_percentage INTEGER;

-- Create a function to calculate score percentage if needed
CREATE OR REPLACE FUNCTION update_score_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score_percentage IS NULL THEN
    NEW.score_percentage := CASE WHEN NEW.score > 0 THEN (NEW.score * 100) / 100 ELSE NEW.score END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for score_percentage (if not exists)
DROP TRIGGER IF EXISTS set_score_percentage ON quiz_attempts;
CREATE TRIGGER set_score_percentage
BEFORE INSERT OR UPDATE ON quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION update_score_percentage();

-- Add question_type column to quizzes table for storing metadata
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_types TEXT[] DEFAULT ARRAY['mcq', 'numerical'];

-- Create a questions table to store individual questions with types
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'subjective')),
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(quiz_id, question_number)
);

-- Create a mcq_options table for multiple choice questions
CREATE TABLE IF NOT EXISTS mcq_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_number INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, option_number)
);

-- Create a numerical_answers table for numerical questions
CREATE TABLE IF NOT EXISTS numerical_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value DECIMAL(10, 4) NOT NULL,
  tolerance DECIMAL(10, 4) DEFAULT 0.01,
  unit TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a question_explanations table
CREATE TABLE IF NOT EXISTS question_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  explanation_text TEXT NOT NULL,
  explanation_type TEXT DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerical_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_explanations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions (public read, admins write)
CREATE POLICY "Questions are publicly readable" ON questions FOR SELECT USING (true);
CREATE POLICY "Admins can insert questions" ON questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update questions" ON questions FOR UPDATE WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for mcq_options (public read, admins write)
CREATE POLICY "MCQ options are publicly readable" ON mcq_options FOR SELECT USING (true);
CREATE POLICY "Admins can insert mcq_options" ON mcq_options FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for numerical_answers (public read, admins write)
CREATE POLICY "Numerical answers are publicly readable" ON numerical_answers FOR SELECT USING (true);
CREATE POLICY "Admins can insert numerical_answers" ON numerical_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for question_explanations (public read, admins write)
CREATE POLICY "Explanations are publicly readable" ON question_explanations FOR SELECT USING (true);
CREATE POLICY "Admins can insert explanations" ON question_explanations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for new tables
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_mcq_options_question_id ON mcq_options(question_id);
CREATE INDEX idx_numerical_answers_question_id ON numerical_answers(question_id);
CREATE INDEX idx_question_explanations_question_id ON question_explanations(question_id);
