'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, ShieldCheck, LogOut, Bell } from 'lucide-react';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const handleLogout = async () => { await logout(); router.push('/'); };

  if (isLanding) {
    return (
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 64, background: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5c842', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 16, color: '#1a1a2e' }}>J</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#ffffff' }}>JEEPrep</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loading && (user ? (
            <>
              <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>Dashboard</Link>
              <button onClick={handleLogout} style={{ padding: '8px 18px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: '8px 18px', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700 }}>Sign in</Link>
              <Link href="/signup" style={{ padding: '10px 22px', borderRadius: 10, background: '#f5c842', color: '#1a1a2e', fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif' }}>Get started →</Link>
            </>
          ))}
        </div>
      </nav>
    );
  }

  // Dark nav for dashboard/books/quiz pages
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 64, background: '#1a1c2e', borderBottom: '1px solid #2d3255', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7b6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 14, color: '#fff' }}>J</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 16, color: '#ffffff' }}>JEEPrep</span>
        </Link>
        <div style={{ display: 'flex', gap: 2 }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
            { href: '/', label: 'Home', icon: <BookOpen size={14} /> },
            ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <ShieldCheck size={14} /> }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: pathname === l.href ? '#ffffff' : '#6b7280', background: pathname === l.href ? 'rgba(123,108,246,0.2)' : 'transparent' }}>
              {l.icon}{l.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!loading && (user ? (
          <>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#12141f', border: '1px solid #2d3255', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={15} color="#6b7280" />
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#7b6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <Link href="/login" style={{ padding: '9px 20px', borderRadius: 10, background: '#7b6cf6', color: '#fff', fontSize: 13, fontWeight: 800 }}>Sign in</Link>
        ))}
      </div>
    </nav>
  );
}
