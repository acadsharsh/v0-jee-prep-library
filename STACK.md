# Technology Stack - JEE Prep Library

Complete overview of technologies, libraries, and architectural decisions.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            Frontend (Next.js 16 + React)             │
│  ├─ App Router (Next.js App Directory)              │
│  ├─ Server Components for data fetching             │
│  ├─ Client Components for interactivity             │
│  └─ Static Generation where possible                │
├─────────────────────────────────────────────────────┤
│           API Routes (Next.js Backend)               │
│  ├─ REST endpoints for CRUD operations              │
│  ├─ Authentication & Authorization                  │
│  └─ Supabase Integration                            │
├─────────────────────────────────────────────────────┤
│  Database (Supabase / PostgreSQL)                   │
│  ├─ Relational schema for books, chapters, quizzes  │
│  ├─ User management with Auth                       │
│  ├─ Row Level Security (RLS) policies               │
│  └─ Real-time subscriptions (optional)              │
└─────────────────────────────────────────────────────┘
```

## Frontend Technologies

### Core Framework
- **Next.js 16.0+**
  - App Router for file-based routing
  - Server Components for data fetching
  - Built-in optimization (image, font, code splitting)
  - Middleware support for auth

### UI Library
- **shadcn/ui v4.0.0**
  - 125+ accessible components
  - Built on Radix UI primitives
  - Headless, fully customizable
  - TypeScript support

### Styling
- **Tailwind CSS v4.0.0**
  - Utility-first CSS framework
  - CSS Nesting for component styles
  - Custom color tokens in globals.css
  - Responsive design with prefixes (md:, lg:, etc.)

### Data Visualization
- **Recharts 2.12.0**
  - React-based charting library
  - Used for performance analytics
  - Bar charts, line charts, tooltips
  - Responsive by default

### Icons
- **Lucide React 0.380+**
  - Modern icon library
  - 600+ icons
  - Customizable color and size
  - Used throughout UI

### Forms & State
- **React Hook Form** (via shadcn/ui)
  - Efficient form management
  - Built-in validation
  - Minimal re-renders

## Backend Technologies

### Runtime
- **Node.js 18+**
- **pnpm** (package manager)

### Database
- **Supabase** (PostgreSQL)
  - Open-source Firebase alternative
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time capabilities
  - RESTful API

### Authentication
- **Supabase Auth**
  - Email/password authentication
  - Email verification
  - Session management
  - OAuth ready

### API Client
- **@supabase/supabase-js**
  - Official Supabase client
  - Query builder syntax
  - Real-time subscriptions
  - TypeScript support

## Database Schema

### Users (via Supabase Auth)
```sql
auth.users (managed by Supabase)
├─ id (UUID)
├─ email
├─ encrypted_password
├─ email_confirmed_at
└─ created_at
```

### User Profiles
```sql
user_profiles
├─ user_id (FK)
├─ full_name
├─ is_admin
├─ created_at
└─ updated_at
```

### Content Tables
```sql
books
├─ id
├─ title
├─ slug
└─ description

chapters
├─ id
├─ book_id (FK)
├─ title
├─ slug
├─ class_number
└─ order

quizzes
├─ id
├─ chapter_id (FK)
├─ title
├─ slug
├─ questions_data (JSON)
└─ metadata

quiz_attempts
├─ id
├─ user_id (FK)
├─ quiz_id (FK)
├─ answers (JSON)
├─ score_percentage
├─ time_taken
└─ created_at
```

## Security

### Row Level Security (RLS)
- Users can only view/modify their own data
- Admins have full access
- Public read-only access to books/chapters
- JWT-based session management

### Password Security
- Supabase handles password hashing (bcrypt)
- HTTPS-only connections
- Secure session cookies

### API Security
- CORS configured
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- Rate limiting ready (can be added)

## File Structure & Organization

### Conventions
```
app/
├─ (auth)/          # Auth route group
├─ api/             # API routes
├─ admin/           # Protected admin routes
├─ books/           # Dynamic book routes
├─ dashboard/       # Protected user dashboard
└─ page.tsx         # Root page

components/
├─ ui/              # shadcn/ui components
├─ navigation.tsx   # Main nav bar
├─ quiz-interface.tsx
└─ stats-dashboard.tsx

lib/
├─ supabase.ts     # Client configuration
├─ auth-context.tsx # Auth provider
└─ types.ts        # TypeScript definitions

styles/
└─ globals.css     # Design tokens & global styles

scripts/
├─ 01-create-schema.sql
└─ 02-seed-data.sql
```

## Performance Optimizations

### Frontend
- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component
- **CSS-in-JS**: Tailwind, no runtime overhead
- **Server Components**: Reduced client JavaScript
- **Caching**: Supabase client-side caching

### Backend
- **Database Indexes**: On frequently queried columns
- **Query Optimization**: Specific column selection
- **Connection Pooling**: Via Supabase
- **RLS Policies**: Efficient access control

### Delivery
- **Static Generation**: Where applicable
- **Incremental Static Regeneration**: Coming soon
- **CDN Distribution**: Via Vercel
- **Compression**: Gzip by default

## Development Workflow

### Local Development
```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server (http://localhost:3000)
```

### Building
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

### Type Checking
```bash
tsc --noEmit      # Run TypeScript compiler
```

## Environment Configuration

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Optional Variables
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://jeeprep.com
```

## Testing

Currently using:
- Browser dev tools for debugging
- Console logging for development
- Manual testing workflow

Recommended additions:
- **Jest** for unit tests
- **Cypress** for E2E tests
- **React Testing Library** for component tests

## Monitoring & Analytics

### Available Options
- **Vercel Analytics** (built-in)
- **Sentry** (error tracking)
- **PostHog** (product analytics)

### Logging
- Server-side: Node.js console
- Client-side: Browser console
- Structured logging recommended for production

## Deployment

### Hosting
- **Vercel** (recommended)
  - Zero-config deployment
  - Automatic HTTPS
  - CDN included
  - Environment variables UI

### Database Hosting
- **Supabase Cloud**
  - Managed PostgreSQL
  - Automatic backups
  - Monitoring dashboard

### CI/CD
- **GitHub Actions** (via Vercel)
  - Automatic deployments on push
  - Preview deployments
  - Performance monitoring

## Scalability Considerations

### Current Capacity
- Suitable for 10,000+ concurrent users
- Up to 1M quizzes
- Unlimited storage (with Supabase plan)

### Bottlenecks
- Database connection limit (based on plan)
- API rate limits (configurable)
- File storage limits (based on plan)

### Scaling Strategy
1. Optimize database queries
2. Add caching layer (Redis via Vercel KV)
3. Database read replicas
4. CDN for static assets
5. Load balancing (handled by Vercel)

## Common Integrations

### Ready to Add
- **Stripe** - Payment processing
- **SendGrid** - Email notifications
- **AWS S3** - File storage
- **Auth0** - Enterprise authentication

### Available but Not Used
- **NextAuth.js** (using Supabase Auth instead)
- **GraphQL** (REST API sufficient)
- **Prisma ORM** (using Supabase client)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support (via shadcn/ui)

## Progressive Enhancement

- Works without JavaScript (basic browsing)
- Graceful degradation for older browsers
- Mobile-first responsive design
- Touch-friendly interfaces

---

## Getting Started with the Stack

1. **Local Setup**
   ```bash
   git clone <repo>
   cd jee-prep-library
   pnpm install
   ```

2. **Environment Setup**
   - Get Supabase credentials
   - Create `.env.local`
   - Run migrations

3. **Development**
   ```bash
   pnpm dev
   ```

4. **Deployment**
   - Push to GitHub
   - Connect to Vercel
   - Auto-deploy on push

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

---

Last Updated: 2026
Technology Stack Version: 1.0
