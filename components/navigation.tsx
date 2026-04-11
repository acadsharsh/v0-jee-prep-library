'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, LogIn, ShieldCheck } from 'lucide-react';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => { await logout(); router.push('/'); };

  const links = [
    { href: '/', label: 'Library', icon: <BookOpen size={15} /> },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <ShieldCheck size={15} /> }] : []),
  ];

  return (
    <nav style={{
      height: 48,
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left — logo + links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link href="/" style={{
          fontWeight: 700, fontSize: 14,
          color: 'var(--tx-1)',
          marginRight: 20,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 5,
            background: 'var(--acc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>J</span>
          JEEPrep
        </Link>

        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 5,
            fontSize: 13, fontWeight: 500,
            color: pathname === l.href ? 'var(--tx-1)' : 'var(--tx-3)',
            background: pathname === l.href ? 'var(--bg-3)' : 'transparent',
            transition: 'all 0.12s',
          }}>
            {l.icon} {l.label}
          </Link>
        ))}
      </div>

      {/* Right — auth */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>{user.email}</span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>
                <LogOut size={12} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: 13, fontWeight: 500, color: 'var(--tx-2)',
                padding: '4px 12px',
              }}>Sign in</Link>
              <Link href="/signup" className="btn-acc" style={{ padding: '5px 14px', fontSize: 12 }}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
