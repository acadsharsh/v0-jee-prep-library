'use client';

import Link from 'next/link';
import { BookOpen, Home, LogOut, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  user?: any;
  isAdmin?: boolean;
}

export function Navigation({ user, isAdmin }: NavigationProps) {
  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="w-6 h-6" />
          <span>JEE Prep Library</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Panel
              </Button>
            </Link>
          )}

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
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
