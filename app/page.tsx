'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const BOOKS = [
  { name:'HC Verma', color:'#f5d90a', short:'HCV' },
  { name:'Irodov', color:'#ff7a00', short:'IRD' },
  { name:'Pathfinder', color:'#0fd68a', short:'PATH' },
  { name:'Black Book', color:'#3d9eff', short:'BB' },
  { name:'DC Pandey', color:'#ff6fd8', short:'DCP' },
  { name:'MS Chouhan', color:'#b06ef3', short:'MSC' },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div style={{ background:'#111', minHeight:'100vh', color:'#fff', fontFamily:'Space Grotesk, sans-serif' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', borderBottom:'3px solid #f5d90a', background:'#0a0a0a', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:'Space Mono, monospace', fontSize:22, fontWeight:700, color:'#f5d90a', letterSpacing:1 }}>JEEPREP*</div>
        <div style={{ display:'flex', gap:8 }}>
          {!loading && (user ? (
            <button onClick={()=>router.push('/dashboard')} className="neu-btn" style={{ fontSize:13 }}>Dashboard →</button>
          ) : (
            <>
              <button onClick={()=>router.push('/login')} style={{ padding:'9px 20px', background:'transparent', color:'#fff', border:'2px solid #444', fontFamily:'Space Grotesk, sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.04em' }}>Sign in</button>
              <button onClick={()=>router.push('/signup')} className="neu-btn" style={{ fontSize:13 }}>Start free →</button>
            </>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'80px 48px 60px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
        <div>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'#1a1a1a', border:'2px solid #f5d90a', marginBottom:24 }}>
            <div style={{ width:8, height:8, background:'#0fd68a', borderRadius:'50%' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#f5d90a', letterSpacing:'0.08em', textTransform:'uppercase' }}>JEE · NEET · 2026</span>
          </div>

          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'clamp(44px, 6vw, 72px)', lineHeight:1.05, letterSpacing:'-2px', marginBottom:24 }}>
            MASTER<br/>
            <span style={{ color:'#f5d90a', WebkitTextStroke:'2px #f5d90a' }}>CHAPTER</span><br/>
            BY CHAPTER.
          </h1>

          <p style={{ fontSize:17, color:'#777', lineHeight:1.7, marginBottom:36, maxWidth:440, fontWeight:400 }}>
            Practice from HCV, Irodov & more. Track your accuracy per chapter. MCQ + MSQ + Numerical — all JEE types.
          </p>

          <div style={{ display:'flex', gap:12 }}>
            {!loading && (user ? (
              <button onClick={()=>router.push('/dashboard')} className="neu-btn" style={{ fontSize:15, padding:'14px 32px' }}>Go to Dashboard ▶</button>
            ) : (
              <>
                <button onClick={()=>router.push('/signup')} className="neu-btn" style={{ fontSize:15, padding:'14px 32px' }}>Start for Free</button>
                <button onClick={()=>router.push('/login')} className="neu-btn-outline neu-btn" style={{ fontSize:15, padding:'14px 28px' }}>Sign in</button>
              </>
            ))}
          </div>
        </div>

        {/* Right — stacked cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'MCQ + MSQ + Numerical', icon:'📝', bg:'#f5d90a', tc:'#0a0a0a' },
            { label:'Instant Explanations', icon:'💡', bg:'#0fd68a', tc:'#0a0a0a' },
            { label:'Live Accuracy Tracking', icon:'📊', bg:'#3d9eff', tc:'#fff' },
            { label:'Chapter-wise Practice', icon:'📖', bg:'#ff7a00', tc:'#fff' },
          ].map((c, i) => (
            <div key={i} style={{ background:c.bg, border:'3px solid #0a0a0a', boxShadow:'5px 5px 0 #0a0a0a', padding:'20px 18px' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:14, fontWeight:700, color:c.tc, lineHeight:1.3 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Yellow ticker */}
      <div style={{ background:'#f5d90a', borderTop:'3px solid #0a0a0a', borderBottom:'3px solid #0a0a0a', padding:'12px 0', overflow:'hidden', whiteSpace:'nowrap' }}>
        <div style={{ display:'inline-flex', animation:'ticker 20s linear infinite', gap:0 }}>
          {Array(8).fill(null).map((_,i) => (
            <span key={i} style={{ fontFamily:'Space Mono, monospace', fontSize:13, fontWeight:700, color:'#0a0a0a', textTransform:'uppercase', letterSpacing:'0.08em', padding:'0 32px' }}>
              PHYSICS ✦ CHEMISTRY ✦ MATHEMATICS ✦ JEE 2026 ✦
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      {/* Books */}
      <section style={{ padding:'60px 48px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ fontFamily:'Space Mono, monospace', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', marginBottom:20 }}>// SUPPORTED BOOKS</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {BOOKS.map(b => (
            <div key={b.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', background:'#1a1a1a', border:'2px solid #333' }}>
              <div style={{ width:10, height:10, background:b.color }} />
              <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding:'0 48px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ fontFamily:'Space Mono, monospace', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', marginBottom:20 }}>// HOW IT WORKS</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { n:'01', title:'Upload Questions', desc:'Use AI to extract questions from any book PDF. Paste the JSON into admin.' },
            { n:'02', title:'Pick a Chapter', desc:'Browse books → chapters. See question count per chapter.' },
            { n:'03', title:'Practice & Track', desc:'Answer questions. Get instant feedback. Track your accuracy over time.' },
          ].map((s,i) => (
            <div key={i} style={{ background:'#1a1a1a', border:'2px solid #333', padding:28 }}>
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:48, fontWeight:700, color:'#222', lineHeight:1, marginBottom:8 }}>{s.n}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8, color:'#fff' }}>{s.title}</div>
              <div style={{ fontSize:13, color:'#666', lineHeight:1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding:'24px 48px', borderTop:'3px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'Space Mono, monospace', fontWeight:700, color:'#f5d90a', fontSize:16 }}>JEEPREP*</span>
        <span style={{ fontSize:12, color:'#444' }}>© 2026 · Built for JEE & NEET</span>
      </footer>
    </div>
  );
}
