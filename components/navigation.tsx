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

  const sections = [
    {
      label: 'Core',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="1" width="6" height="6" rx="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.2"/></svg> },
        { href: '/mistakes',  label: 'Mistakes',   icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4l8 8M12 4l-8 8"/></svg> },
        { href: '/flashcards',label: 'Flashcards', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg> },
      ],
    },
    {
      label: 'Resources',
      items: [
        { href: '/dashboard', label: 'Library', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 2h7l3 3v9H3z"/><path d="M10 2v4h3"/></svg>, exact: true, scrollTo: 'practice-bank' },
        ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M11.3 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4"/></svg> }] : []),
      ],
    },
  ];

  return (
    <aside style={{ width: 230, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
      {/* Gold top line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,var(--gold),transparent)', opacity: 0.4 }} />

      {/* Logo */}
      <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '0.05em', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gold-dim)', border: '1px solid rgba(240,192,64,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚡</div>
          JEEPREP
        </div>
        <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, letterSpacing: '0.04em' }}>Command Center · 2026</div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--faint)', textTransform: 'uppercase', padding: '0 8px 8px', marginTop: 4 }}>{section.label}</div>
            {section.items.map(item => {
              const isActive = 'exact' in item && item.exact ? false : pathname.startsWith(item.href) && item.href !== '/dashboard' || (item.href === '/dashboard' && pathname === '/dashboard');
              return (
                <Link key={item.href + item.label} href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                    borderRadius: 7, color: isActive ? 'var(--gold)' : 'var(--text2)',
                    fontSize: 12.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    textDecoration: 'none', marginBottom: 2, position: 'relative',
                    background: isActive ? 'var(--gold-dim)' : 'transparent',
                    border: isActive ? '1px solid rgba(240,192,64,0.2)' : '1px solid transparent',
                  }}>
                  {isActive && <div style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--gold)', borderRadius: '0 2px 2px 0' }} />}
                  <span style={{ opacity: isActive ? 1 : 0.7, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        {!loading && user ? (
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-dim)', border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--gold)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{ini}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text2)' }}>Sign out</div>
            </div>
          </div>
        ) : !loading ? (
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: 'var(--gold)', color: '#000', borderRadius: 7, fontWeight: 700, fontSize: 13 }}>Sign in</Link>
        ) : null}
      </div>
    </aside>
  );
}
