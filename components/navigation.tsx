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
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:64, background:'transparent', position:'absolute', top:0, left:0, right:0, zIndex:50 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#FFD23F', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:18, color:'#0d0d0d' }}>J</div>
          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:18, color:'#fff', letterSpacing:'-0.3px' }}>JEEPrep</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {!loading && (user ? (
            <>
              <Link href="/dashboard" style={{ padding:'9px 20px', borderRadius:10, background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:13, fontWeight:700, border:'1px solid rgba(255,255,255,0.15)' }}>Dashboard</Link>
              <button onClick={handleLogout} style={{ padding:'9px 20px', borderRadius:10, background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:700, border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding:'9px 18px', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600 }}>Sign in</Link>
              <Link href="/signup" style={{ padding:'10px 22px', borderRadius:10, background:'#FFD23F', color:'#0d0d0d', fontSize:13, fontWeight:800, fontFamily:'Space Grotesk,sans-serif' }}>Get started →</Link>
            </>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:58, background:'#0d0d0d', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'#FFD23F', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:16, color:'#0d0d0d' }}>J</div>
          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:15, color:'#fff', letterSpacing:'-0.2px' }}>JEEPrep</span>
        </Link>
        <div style={{ width:1, height:20, background:'rgba(255,255,255,0.1)' }} />
        <div style={{ display:'flex', gap:2 }}>
          {[
            { href:'/dashboard', label:'Dashboard', icon:<LayoutDashboard size={14}/> },
            { href:'/', label:'Library', icon:<BookOpen size={14}/> },
            ...(isAdmin ? [{ href:'/admin', label:'Admin', icon:<ShieldCheck size={14}/> }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:9, fontSize:13, fontWeight:600, color: pathname===l.href ? '#FFD23F' : 'rgba(255,255,255,0.45)', background: pathname===l.href ? 'rgba(255,210,63,0.1)' : 'transparent', transition:'all .15s' }}>
              {l.icon}{l.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {!loading && (user ? (
          <>
            <div style={{ width:34, height:34, borderRadius:9, background:'#141414', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Bell size={15} color="rgba(255,255,255,0.4)" />
            </div>
            <div style={{ width:34, height:34, borderRadius:9, background:'#7C5CBF', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'#fff', fontFamily:'Space Grotesk,sans-serif' }}>
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, background:'rgba(255,82,82,0.1)', color:'#FF5252', border:'1px solid rgba(255,82,82,0.2)', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'DM Sans,sans-serif' }}>
              <LogOut size={12}/> Sign out
            </button>
          </>
        ) : (
          <Link href="/login" style={{ padding:'9px 20px', borderRadius:9, background:'#FFD23F', color:'#0d0d0d', fontSize:13, fontWeight:800, fontFamily:'Space Grotesk,sans-serif' }}>Sign in</Link>
        ))}
      </div>
    </nav>
  );
}
