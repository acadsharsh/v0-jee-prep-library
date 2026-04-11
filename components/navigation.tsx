'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="topnav">
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:28, height:28, background:'var(--lime)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'Space Mono, monospace', fontWeight:700, fontSize:13, color:'var(--black)',
        }}>J*</div>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.3px' }}>JEEPrep</span>
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
        {[
          { href:'/', label:'Library' },
          ...(user ? [{ href:'/dashboard', label:'Dashboard' }] : []),
          ...(isAdmin ? [{ href:'/admin', label:'Admin' }] : []),
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            padding:'6px 16px', fontSize:13, fontWeight:600,
            textTransform:'uppercase', letterSpacing:'0.04em',
            borderLeft:'1px solid var(--dim)',
            color: pathname === l.href ? 'var(--lime)' : 'var(--muted)',
            transition:'color 0.1s',
          }}>{l.label}</Link>
        ))}

        {!loading && (
          user ? (
            <button onClick={async () => { await logout(); router.push('/'); }}
              className="btn-outline" style={{ marginLeft:16, padding:'6px 16px', fontSize:12 }}>
              Exit
            </button>
          ) : (
            <Link href="/login" className="btn-lime" style={{ marginLeft:16, padding:'7px 18px', fontSize:12 }}>
              Sign in
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
