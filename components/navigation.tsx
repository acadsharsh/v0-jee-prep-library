'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const pathname = usePathname();
  if (pathname === '/') return null;

  const ini = user?.email?.slice(0, 2).toUpperCase() ?? 'JE';
  const name = user?.email?.split('@')[0] ?? 'User';
  const handleLogout = async () => { await logout(); window.location.href = '/'; };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard',   icon: '⬡' },
    { href: '/mistakes',  label: 'Mistakes',    icon: '✕', accent: 'var(--coral)' },
    { href: '/flashcards',label: 'Flashcards',  icon: '◈', accent: 'var(--sky)' },
    { href: '/diagram',   label: 'Diagram Lab', icon: '△', accent: 'var(--teal)' },
    { href: '/',          label: 'Library',     icon: '⊞' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: '⚙', accent: 'var(--purple)' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot" />
        JEEPREP
      </div>

      <div className="sidebar-section">Menu</div>
      {navItems.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            style={!isActive && item.accent ? { color: `${item.accent}66` } : {}}>
            <span className="si-icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <div className="sidebar-spacer" />

      {!loading && user && (
        <div className="sidebar-user" onClick={handleLogout} title="Click to sign out">
          <div className="user-avatar">{ini}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div className="user-role">Sign out</div>
          </div>
        </div>
      )}
      {!loading && !user && (
        <Link href="/login" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Sign in</Link>
      )}
    </aside>
  );
}
