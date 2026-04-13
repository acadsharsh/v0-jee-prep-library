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

  if (isLanding) return null;

  const ini = user?.email?.slice(0,2).toUpperCase() ?? 'JE';
  const name = user?.email?.split('@')[0] ?? 'User';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', ic: '◼' },
    { href: '/', label: 'Home', ic: '◈' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', ic: '⚙' }] : []),
  ];

  return (
    <aside className="neo-sidebar">
      <div className="neo-logo">
        <span style={{ fontFamily:'Space Mono, monospace', fontWeight:700 }}>JEEP*</span>
      </div>

      <div className="neo-sec">Navigate</div>
      {navItems.map(item => (
        <Link key={item.href} href={item.href}
          className={`neo-sbi ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : pathname === item.href && item.href === '/' ? 'active' : pathname === '/dashboard' && item.href === '/dashboard' ? 'active' : ''}`}>
          <span className="ic" style={{ fontFamily:'Space Mono, monospace' }}>{item.ic}</span>
          {item.label}
        </Link>
      ))}

      <div className="neo-sec" style={{ marginTop: 16 }}>Books</div>
      <Link href="/books/hcv" className="neo-sbi" style={{ fontSize: 12 }}>
        <span className="ic">⚡</span> HCV
      </Link>
      <Link href="/books/irodov" className="neo-sbi" style={{ fontSize: 12 }}>
        <span className="ic">◎</span> Irodov
      </Link>

      <div className="neo-sp" />

      {!loading && user && (
        <div className="neo-user" onClick={handleLogout} title="Click to sign out">
          <div className="neo-av" style={{ fontFamily:'Space Mono, monospace' }}>{ini}</div>
          <div>
            <div className="neo-name">{name}</div>
            <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Sign out →</div>
          </div>
        </div>
      )}
      {!loading && !user && (
        <Link href="/login" style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'10px',background:'var(--yellow)',color:'var(--black)',border:'2px solid var(--yellow)',fontWeight:700,fontSize:13,textAlign:'center',textTransform:'uppercase',letterSpacing:'0.05em' }}>
          Sign in →
        </Link>
      )}
    </aside>
  );
}
