# Quick Start Guide - JEE Prep Library

Get up and running with JEE Prep Library in minutes!

## 5-Minute Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

Get these from your Supabase project settings.

### 3. Set Up Database
The schema is already created and migrations are provided in `/scripts`:
- `01-create-schema.sql` - Database tables and RLS policies
- `02-seed-data.sql` - Sample books and chapters

Run these in your Supabase SQL editor or execute via:
```bash
# If using Supabase CLI
supabase db push
```

### 4. Create Admin User
First, sign up normally at `/signup`. Then, make yourself an admin:

```sql
UPDATE user_profiles
SET is_admin = true
WHERE user_id = 'your-user-id';
```

Get your user ID from the `auth.users` table.

### 5. Start Development
```bash
pnpm dev
```

Visit http://localhost:3000

## 🎯 First Steps

### As a Student
1. **Sign Up** at `/signup`
2. **Browse Books** on homepage
3. **Select a Chapter** and take a quiz
4. **View Dashboard** for progress tracking

### As an Admin
1. **Make yourself admin** (see step 4 above)
2. **Go to Admin Panel** at `/admin`
3. **Upload sample quiz** (see format in ADMIN_GUIDE.md)
4. **Quiz appears immediately** in the platform

## 📊 Sample Quiz JSON

Quick template to get started:

```json
{
  "title": "Vectors Basics",
  "slug": "vectors-basics",
  "book_slug": "hcv",
  "class_number": 11,
  "chapter_name": "Vectors",
  "chapter_slug": "vectors",
  "description": "Basic concepts of vectors",
  "total_questions": 2,
  "questions": [
    {
      "id": "q1",
      "question": "What is a vector?",
      "type": "mcq",
      "difficulty": "easy",
      "options": [
        {
          "id": "a",
          "text": "A quantity with only magnitude",
          "explanation": "That's a scalar, not a vector."
        },
        {
          "id": "b",
          "text": "A quantity with magnitude and direction",
          "is_correct": true,
          "explanation": "Correct! Vectors have both magnitude and direction."
        },
        {
          "id": "c",
          "text": "A unit of force",
          "explanation": "Force is one type of vector, but not the definition."
        },
        {
          "id": "d",
          "text": "An imaginary number",
          "explanation": "Vectors are not imaginary numbers."
        }
      ]
    }
  ]
}
```

## 🔓 Access Levels

| Feature | Guest | Student | Admin |
|---------|-------|---------|-------|
| View Books | ✅ | ✅ | ✅ |
| Take Quizzes | ✅ | ✅ | ✅ |
| Save Progress | ❌ | ✅ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ |
| Upload Quizzes | ❌ | ❌ | ✅ |
| Admin Panel | ❌ | ❌ | ✅ |

## 📚 Available Books (Pre-seeded)

- **HCV** (Hindustan Book Company)
  - Class 11: Mechanics, Thermodynamics
  - Class 12: Electromagnetism, Optics

- **Irodov** (Problem Book in Physics)
  - Mechanics problems
  - Thermodynamics problems

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel deploy
```

### Environment on Vercel
Add these in Project Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🐛 Common Issues

### Issue: "Sign up not working"
**Solution**: Check Supabase project is active and anon key is correct

### Issue: "Can't access admin panel"
**Solution**: Ensure you set `is_admin = true` in database

### Issue: "Quiz questions not showing"
**Solution**: Verify JSON format matches schema exactly

### Issue: "Can't upload quiz"
**Solution**: Validate JSON at jsonlint.com before uploading

## 📖 Full Documentation

- See [README.md](./README.md) for complete feature documentation
- See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for detailed admin instructions
- Check [STACK.md](./STACK.md) for technical architecture

## 💡 Next Steps

1. ✅ Get development running
2. ✅ Create admin account
3. ✅ Upload sample quizzes
4. ✅ Create student accounts
5. ✅ Customize design/colors
6. ✅ Add more quizzes
7. ✅ Deploy to production

## 🎓 Features to Explore

- **Quiz Timer**: Automatically times each quiz
- **Score Breakdown**: See detailed attempt history
- **Progress Charts**: Visual performance analytics
- **Leaderboards**: (Coming soon)
- **Difficulty Levels**: Easy, Medium, Hard questions

## 🤝 Need Help?

- Check the README.md for detailed documentation
- Review ADMIN_GUIDE.md for admin features
- Visit Supabase documentation: https://supabase.com/docs

---

**Ready? Start with `pnpm dev` and visit http://localhost:3000** 🚀
