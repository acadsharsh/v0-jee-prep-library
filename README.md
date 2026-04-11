# JEE Prep Library - Interactive Physics Quiz Platform

A comprehensive, modern web application for JEE physics preparation with interactive chapter-wise quizzes, progress tracking, and performance analytics.

## 🎯 Features

- **Interactive Quizzes**: Chapter-wise physics quizzes from popular textbooks (HCV, Irodov, etc.)
- **Progress Tracking**: Detailed analytics and performance metrics for each quiz attempt
- **User Authentication**: Secure authentication with Supabase
- **Hierarchical Navigation**: Intuitive navigation (Books → Classes → Chapters → Quizzes)
- **Admin Panel**: Upload and manage quiz content
- **Responsive Design**: Modern UI optimized for all devices
- **Real-time Statistics**: Track average scores, attempt history, and topics covered

## 🛠️ Tech Stack

- **Frontend**: Next.js 16+ with App Router
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin endpoints
│   │   ├── auth/               # Authentication
│   │   ├── books/              # Book data
│   │   ├── quizzes/            # Quiz content
│   │   └── quiz-attempts/      # Quiz submissions
│   ├── (auth)/                 # Auth pages (login, signup)
│   ├── books/                  # Book and chapter pages
│   ├── admin/                  # Admin panel
│   ├── dashboard/              # User dashboard
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── navigation.tsx          # Navigation bar
│   ├── bookshelf.tsx           # Book grid display
│   ├── quiz-interface.tsx      # Quiz interface
│   ├── quiz-results.tsx        # Results screen
│   └── stats-dashboard.tsx     # Statistics widget
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── auth-context.tsx        # Auth context provider
│   └── types.ts                # TypeScript types
└── scripts/
    ├── 01-create-schema.sql    # Database schema
    └── 02-seed-data.sql        # Sample data
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account

### Installation

1. **Clone and Setup**
```bash
git clone <repository>
cd jee-prep-library
pnpm install
```

2. **Environment Variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Database Setup**
The database schema is automatically set up through the migration scripts.

4. **Run Development Server**
```bash
pnpm dev
```

Visit http://localhost:3000

## 📊 Database Schema

### Core Tables
- **books**: Textbook metadata and organization
- **chapters**: Topic divisions within books
- **quizzes**: Quiz metadata with questions
- **user_profiles**: User information and admin status
- **quiz_attempts**: User quiz submissions and scores

### Row Level Security (RLS)
All user-specific data is protected with RLS policies:
- Users can only view their own attempts
- Only admins can upload quiz content
- Public read access for books and chapters

## 🔐 Authentication

- **Signup**: Email verification required
- **Login**: Email/password authentication
- **Admin Access**: Controlled via `is_admin` flag in user_profiles
- **Session Management**: Secure client-side session handling

## 📱 API Endpoints

### Public
- `GET /api/books` - List all books
- `GET /api/books/[bookSlug]/chapters` - Get chapters for a book
- `GET /api/quizzes/[quizId]` - Get quiz questions

### Authenticated
- `POST /api/quiz-attempts` - Submit quiz answers
- `GET /api/user/stats` - Get user statistics
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in

### Admin Only
- `POST /api/admin/upload-quiz` - Upload quiz content

## 🎨 UI Components

All components use shadcn/ui and are styled with Tailwind CSS:
- **Cards**: Reusable card containers
- **Buttons**: With variants and loading states
- **Inputs**: Form inputs with validation
- **Charts**: Bar charts for performance visualization

## 📊 Features Deep Dive

### Quiz Interface
- Multiple choice questions with instant feedback
- Progress indicator showing current question
- Score calculation and immediate results
- Ability to review answers before submission

### Dashboard
- Overall statistics (attempts, average score, topics)
- Performance charts by chapter
- Recent attempt history
- Quick navigation to study materials

### Admin Panel
- Upload quiz content (JSON format)
- Manage books and chapters
- View user statistics and engagement

## 🔧 Customization

### Adding New Books
1. Insert book record in database
2. Add chapters associated with the book
3. Create quizzes for each chapter

### Customizing Styling
- Design tokens are defined in `globals.css`
- Tailwind CSS configuration in `tailwind.config.js`
- Component styles in individual component files

### Adding New Features
- Create new API routes in `app/api/`
- Add components in `components/`
- Update types in `lib/types.ts`

## 📈 Performance Optimization

- Server-side rendering for initial page load
- Client-side data caching with React state
- Optimized database queries with indexes
- Image optimization with Next.js Image component
- Code splitting for faster page navigation

## 🐛 Troubleshooting

### Authentication Issues
- Verify Supabase credentials in `.env.local`
- Check email verification status
- Clear browser cache and cookies

### Database Connection
- Ensure Supabase project is active
- Verify Row Level Security policies
- Check network connectivity

### Quiz Data Not Loading
- Verify quiz_id exists in database
- Check user has access to quiz
- Review API response in browser DevTools

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please create an issue in the repository or contact support.

---

**Happy studying! 📚🚀**
