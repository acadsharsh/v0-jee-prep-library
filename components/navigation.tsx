'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, LogOut, Bell, Home, BookOpen } from 'lucide-react';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const handleLogout = async () => { await logout(); router.push('/'); };

  if (isLanding) return null;

  return (
    <nav className="dash-topnav">
      {/* Left — logo + nav pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#fff' }}>J</div>
          <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#FFFFFF', letterSpacing: 0.5 }}>JEEPrep</span>
        </Link>

        {/* Center pill nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '4px' }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
            { href: '/', label: 'Home', icon: <Home size={14} /> },
            ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <ShieldCheck size={14} /> }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              fontSize: 13, fontWeight: 800,
              color: pathname === l.href ? '#1A1A2E' : 'rgba(255,255,255,0.6)',
              background: pathname === l.href ? '#FFFFFF' : 'transparent',
              transition: 'all 0.15s',
              fontFamily: 'Nunito, sans-serif',
            }}>{l.icon}{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Right — user info */}
      {!loading && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}>
              Hello, {user.email?.split('@')[0] ?? 'Student'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              ⚡ JEEPrep Member
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#7C3AED', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#fff' }}>
            {user.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={16} color="rgba(255,255,255,0.7)" />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #1E1E2E' }} />
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#F87171', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>
            <LogOut size={12} /> Out
          </button>
        </div>
      )}
      {!loading && !user && (
        <Link href="/login" style={{ padding: '8px 20px', borderRadius: 12, background: '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>Sign in</Link>
      )}
    </nav>
  );
}
