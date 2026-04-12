'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, LogOut, Bell, Home } from 'lucide-react';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const handleLogout = async () => { await logout(); router.push('/'); };

  if (isLanding) return null; // landing has its own inline nav

  return (
    <nav className="dash-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One, cursive', fontSize: 16, color: '#fff' }}>J</div>
          <span style={{ fontFamily: 'Lilita One, cursive', fontSize: 18, color: '#1A1A2E', letterSpacing: 0.5 }}>JEEPrep</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
            { href: '/', label: 'Home', icon: <Home size={15} /> },
            ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <ShieldCheck size={15} /> }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 800,
              color: pathname === l.href ? '#7C3AED' : '#7C8DB0',
              background: pathname === l.href ? '#EDE9FE' : 'transparent',
              transition: 'all 0.12s',
            }}>{l.icon}{l.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!loading && (user ? (
          <>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F2F4F8', border: '1px solid #E8EAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={15} color="#7C8DB0" />
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One, cursive', fontSize: 15, color: '#fff' }}>
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <Link href="/login" style={{ padding: '9px 20px', borderRadius: 12, background: '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>Sign in</Link>
        ))}
      </div>
    </nav>
  );
}
