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

  // Landing nav — transparent, dark
  if (isLanding) {
    return (
      <nav className="land-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#f5c842',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 16, color: '#1a1a2e',
          }}>J</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#ffffff' }}>JEEPrep</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loading && (user ? (
            <>
              <Link href="/dashboard" style={{
                padding: '8px 18px', borderRadius: 10,
                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)',
              }}>Dashboard</Link>
              <button onClick={handleLogout} style={{
                padding: '8px 18px', borderRadius: 10,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: '8px 18px', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700 }}>Sign in</Link>
              <Link href="/signup" style={{
                padding: '10px 22px', borderRadius: 10,
                background: '#f5c842', color: '#1a1a2e',
                fontSize: 14, fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
              }}>Get started →</Link>
            </>
          ))}
        </div>
      </nav>
    );
  }

  // Dashboard nav — white, light
  return (
    <nav className="dash-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#7b6cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 14, color: '#fff',
          }}>J</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 16, color: '#1e1e2d' }}>JEEPrep</span>
        </Link>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { href: '/', label: 'Library', icon: <BookOpen size={14} /> },
            ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> }] : []),
            ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <ShieldCheck size={14} /> }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, color: pathname === l.href ? '#7b6cf6' : '#9ca3af',
              background: pathname === l.href ? '#ede9fe' : 'transparent',
            }}>{l.icon}{l.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!loading && (user ? (
          <>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#f4f5fb', border: '1px solid #e8e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Bell size={15} color="#9ca3af" />
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#7b6cf6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#fff',
            }}>
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              background: '#fee2e2', color: '#ef4444',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
            }}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <Link href="/login" style={{
            padding: '9px 20px', borderRadius: 10,
            background: '#7b6cf6', color: '#fff',
            fontSize: 13, fontWeight: 800,
          }}>Sign in</Link>
        ))}
      </div>
    </nav>
  );
}
