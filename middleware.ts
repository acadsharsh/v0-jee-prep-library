import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple cookie-based check — no external package needed
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Check for supabase auth cookie (sb-*-auth-token)
  const cookies = req.cookies;
  const hasSession = [...cookies.getAll()].some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  const pathname = req.nextUrl.pathname;

  // Protect dashboard
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/mistakes') || pathname.startsWith('/flashcards')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/mistakes/:path*', '/flashcards/:path*'],
};
