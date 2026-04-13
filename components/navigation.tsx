'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const handleLogout = async () => { await logout(); router.push('/'); };

  if (isLanding) return null; // landing has inline nav

  const ini = user?.email?.slice(0, 2).toUpperCase() ?? 'U';
  const name = user?.email?.split('@')[0] ?? 'User';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', ic: '🏠' },
    { href: '/', label: 'Home', ic: '📚' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', ic: '⚙️' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sblogo"><span className="dot" /><span>JEEPrep</span></div>
      <div className="sbsec">Menu</div>
      {navItems.map(item => (
        <Link key={item.href} href={item.href}
          className={`sbi ${pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard')) ? 'active' : ''}`}>
          <span className="ic">{item.ic}</span>{item.label}
        </Link>
      ))}

      {/* Book sections */}
      <div className="sbsec" style={{ marginTop: 16 }}>Books</div>
      <Link href="/books/hcv" className="sbi" style={{ fontSize: 12 }}>
        <span className="ic">⚡</span>HCV
      </Link>
      <Link href="/books/irodov" className="sbi" style={{ fontSize: 12 }}>
        <span className="ic">🔬</span>Irodov
      </Link>

      <div className="sbsp" />

      {!loading && user && (
        <div className="sbuser" onClick={handleLogout} title="Click to sign out">
          <div className="sbav">{ini}</div>
          <div>
            <div className="sbname">{name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>Sign out</div>
          </div>
        </div>
      )}
      {!loading && !user && (
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 12, background: 'var(--or)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
          Sign in
        </Link>
      )}
    </aside>
  );
}
