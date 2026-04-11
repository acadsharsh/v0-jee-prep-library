'use client';

import Link from 'next/link';
import { Zap, LogOut, LogIn, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,12,16,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800, fontSize: 16,
            color: '#f0f2f7',
            letterSpacing: '-0.3px',
          }}>
            JEE<span style={{ color: '#4f8ef7' }}>Prep</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { href: '/', label: 'Library' },
            ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
            ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Syne, sans-serif',
              textDecoration: 'none',
              color: isActive(href) ? '#f0f2f7' : '#8b92a5',
              background: isActive(href) ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: isActive(href) ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>
              {label}
            </Link>
          ))}

          {!loading && (
            <>
              {user ? (
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 500,
                  background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginLeft: 8,
                }}>
                  <LogOut size={13} />
                  Sign out
                </button>
              ) : (
                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 600,
                  background: '#4f8ef7',
                  color: '#fff',
                  textDecoration: 'none',
                  marginLeft: 8,
                  transition: 'all 0.15s',
                }}>
                  <LogIn size={13} />
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
