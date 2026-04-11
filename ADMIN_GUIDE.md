# Admin Guide - JEE Prep Library

## Overview

The Admin Panel allows authorized administrators to upload and manage quiz content for the platform. This guide explains how to use the admin features.

## Admin Privileges

Only users with `is_admin = true` in their `user_profiles` record can access the admin panel.

### Granting Admin Access

To make a user an admin, update their profile in the database:

```sql
UPDATE user_profiles
SET is_admin = true
WHERE user_id = 'user-uuid-here';
```

## Uploading Quizzes

### Admin Panel URL
```
https://yourdomain.com/admin
```

### Quiz JSON Format

Quizzes must be uploaded in the following JSON format:

```json
{
  "title": "Motion in a Straight Line",
  "slug": "motion-straight-line",
  "book_slug": "hcv",
  "class_number": 11,
  "chapter_name": "Kinematics",
  "chapter_slug": "kinematics",
  "description": "Test your understanding of motion concepts",
  "total_questions": 30,
  "questions": [
    {
      "id": "q1",
      "question": "A particle moves with uniform acceleration. Which graph represents its position-time relationship?",
      "type": "mcq",
      "options": [
        {
          "id": "opt1",
          "text": "Straight line",
          "explanation": "This would indicate constant velocity, not acceleration."
        },
        {
          "id": "opt2",
          "text": "Parabola",
          "explanation": "Correct! For uniform acceleration, position varies as t².",
          "is_correct": true
        },
        {
          "id": "opt3",
          "text": "Exponential curve",
          "explanation": "Exponential motion occurs in specific cases, not general acceleration."
        },
        {
          "id": "opt4",
          "text": "Hyperbola",
          "explanation": "A hyperbola doesn't match the kinematics equation for constant acceleration."
        }
      ],
      "difficulty": "medium",
      "source": "HCV - Chapter 3"
    },
    {
      "id": "q2",
      "question": "A ball is thrown vertically upward with an initial velocity of 20 m/s. How long will it take to return to the starting point? (g = 10 m/s²)",
      "type": "mcq",
      "options": [
        {
          "id": "opt1",
          "text": "2 seconds",
          "explanation": "This is only the time to reach maximum height."
        },
        {
          "id": "opt2",
          "text": "4 seconds",
          "explanation": "Correct! Using v = u - gt, time to max height = 2s, total time = 4s.",
          "is_correct": true
        },
        {
          "id": "opt3",
          "text": "1 second",
          "explanation": "This is too short for the given initial velocity."
        },
        {
          "id": "opt4",
          "text": "6 seconds",
          "explanation": "This exceeds the expected time for the given conditions."
        }
      ],
      "difficulty": "easy",
      "source": "HCV - Chapter 3"
    }
  ]
}
```

### JSON Field Reference

#### Root Level
- `title` (string, required): Quiz title
- `slug` (string, required): URL-friendly identifier
- `book_slug` (string, required): Reference to book slug
- `class_number` (number, required): Class level (11 or 12)
- `chapter_name` (string, required): Chapter name
- `chapter_slug` (string, required): URL-friendly chapter identifier
- `description` (string, optional): Quiz description
- `total_questions` (number, required): Total number of questions

#### Questions Array
Each question object contains:
- `id` (string, required): Unique question ID
- `question` (string, required): Question text
- `type` (string, required): Question type (currently "mcq")
- `difficulty` (string, optional): "easy", "medium", or "hard"
- `source` (string, optional): Source reference

#### Options Array
Each option in a question:
- `id` (string, required): Unique option ID
- `text` (string, required): Option text
- `is_correct` (boolean): Mark one option as correct (default: false)
- `explanation` (string, required): Explanation for this option

### Example Upload Workflow

1. **Prepare Your Data**
   - Create a JSON file following the format above
   - Ensure all questions have exactly one correct answer
   - Include helpful explanations for all options

2. **Copy JSON**
   - Copy the entire JSON content

3. **Navigate to Admin Panel**
   - Go to `https://yourdomain.com/admin`
   - You should see the quiz upload form

4. **Paste JSON**
   - Paste your JSON into the text area
   - System will validate the format

5. **Submit**
   - Click "Upload Quiz" button
   - Wait for confirmation message

6. **Verification**
   - Quiz will be available in the platform immediately
   - Users can access it through the corresponding chapter

## Managing Quiz Content

### Viewing Uploaded Quizzes

Currently, all uploaded quizzes are automatically available on the platform through:
- Book → Class → Chapter → Quiz navigation

### Editing Quizzes

To edit a quiz, you can:
1. Delete the existing quiz entries from the database
2. Upload the updated quiz via the admin panel

### Deleting Quizzes

Use the database directly:

```sql
-- Delete a specific quiz
DELETE FROM quizzes
WHERE slug = 'quiz-slug-here';

-- This will cascade delete associated quiz_attempts
```

## User Statistics and Monitoring

### View User Performance

Query user statistics:

```sql
-- Get all user attempts
SELECT 
  ua.user_id,
  up.full_name,
  COUNT(*) as total_attempts,
  AVG(ua.score_percentage) as average_score,
  MAX(ua.created_at) as last_attempt
FROM quiz_attempts ua
JOIN user_profiles up ON ua.user_id = up.user_id
GROUP BY ua.user_id, up.full_name
ORDER BY average_score DESC;
```

### Popular Quizzes

```sql
-- Find most attempted quizzes
SELECT 
  q.title,
  q.slug,
  COUNT(qa.id) as total_attempts,
  AVG(qa.score_percentage) as average_score
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
GROUP BY q.id, q.title, q.slug
ORDER BY total_attempts DESC;
```

## Troubleshooting

### "Invalid JSON" Error
- Verify JSON syntax is valid
- Use a JSON validator tool
- Check for proper escaping of quotes in text

### "Quiz already exists" Error
- Quiz with same slug already exists
- Change the slug to a unique value
- Or delete the existing quiz first

### Quiz not appearing in platform
- Verify the book and chapter exist in the database
- Check that book_slug and chapter_slug match existing records
- Ensure user has access permissions for the chapter

### Users can't see their quiz attempts
- Verify Row Level Security (RLS) is properly configured
- Check that user_id in quiz_attempts matches their auth user_id

## Best Practices

1. **Consistent Slugs**: Use lowercase, hyphens for separators
2. **Clear Questions**: Avoid ambiguous or trick questions
3. **Helpful Explanations**: Explain why correct answer is right AND why others are wrong
4. **Difficulty Levels**: Distribute questions across difficulty levels
5. **Source References**: Always include where questions come from
6. **Testing**: Test each quiz before publishing by taking it as a user
7. **Updates**: Keep quiz content current and accurate

## Support

For issues with the admin panel or quiz uploads, contact the development team or check the main README.md for troubleshooting.

---

Last updated: 2026
