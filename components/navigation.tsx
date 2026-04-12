'use client';

import Link from 'next/link';
import { BookOpen, LogOut, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-400 transition-all">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span>JEE Prep Library</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
              >
                Admin Panel
              </Button>
            </Link>
          )}

          {!loading && user ? (
            <>
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-300 hover:text-blue-400 hover:bg-blue-500/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-300 hover:text-blue-400 hover:bg-blue-500/10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
