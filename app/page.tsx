'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const BOOKS = ['HC Verma','Irodov','Pathfinder','Black Book','Cengage','DC Pandey','MS Chouhan','VK Jaiswal'];
  const BCOLORS: Record<string,string> = {'HC Verma':'#7C6FF7','Irodov':'#FF6B35','Pathfinder':'#22C55E','Black Book':'#3B82F6','Cengage':'#EC4899','DC Pandey':'#F59E0B','MS Chouhan':'#8B5CF6','VK Jaiswal':'#EF4444'};

  return (
    <div className="land-root" style={{ minHeight:'100vh' }}>
      {/* Nav */}
      <nav className="lnav">
        <div className="llogo"><span className="dot" /><span style={{ fontFamily:'Syne,sans-serif' }}>JEEPrep</span></div>
        <div style={{ display:'flex',alignItems:'center',gap:32 }}>
          <a style={{ color:'rgba(255,255,255,.6)',fontSize:14,fontWeight:500,cursor:'pointer' }}>Features</a>
          <a style={{ color:'rgba(255,255,255,.6)',fontSize:14,fontWeight:500,cursor:'pointer' }}>Books</a>
        </div>
        {!loading && (user
          ? <button className="lbtn" onClick={()=>router.push('/dashboard')}>Dashboard →</button>
          : <button className="lbtn" onClick={()=>router.push('/login')}>Start Practicing →</button>
        )}
      </nav>

      {/* Hero */}
      <section style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 40px 80px',position:'relative' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,111,247,.3) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 80% 80%,rgba(255,107,53,.15) 0%,transparent 50%)',pointerEvents:'none' }} />
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:100,padding:'7px 18px',fontSize:13,marginBottom:28 }}>
          <span className="ping" />&nbsp;JEE · NEET · Foundation
        </div>
        <h1 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(42px,7vw,80px)',fontWeight:800,lineHeight:1.05,letterSpacing:'-2px',marginBottom:24 }}>
          Master Your Books.<br/>Crack <span style={{ color:'var(--or)' }}>JEE & NEET.</span>
        </h1>
        <p style={{ fontSize:18,color:'rgba(255,255,255,.55)',maxWidth:520,lineHeight:1.7,marginBottom:44,fontWeight:300 }}>
          Chapter-wise practice from HCV, Irodov, Pathfinder & more. Track your accuracy, fix weak spots, ace the exam.
        </p>
        <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
          {!loading && (user
            ? <button className="bprim" onClick={()=>router.push('/dashboard')}>Go to Dashboard</button>
            : <>
                <button className="bprim" onClick={()=>router.push('/signup')}>Start for Free</button>
                <button className="bout" onClick={()=>router.push('/login')}>Sign in</button>
              </>
          )}
        </div>

        {/* Stats cards */}
        <div style={{ display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginTop:64 }}>
          {[{icon:'📚',val:'12+',lbl:'Reference Books'},{icon:'⚡',val:'MCQ+MSQ+Num',lbl:'Question types'},{icon:'🎯',val:'Chapter-wise',lbl:'Organized practice'},{icon:'📊',val:'Live',lbl:'Analytics'}].map((c,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'var(--r)',padding:'20px 24px',textAlign:'left',minWidth:150,backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:26,marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800 }}>{c.val}</div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,.5)',marginTop:2 }}>{c.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Books strip */}
      <div style={{ padding:'40px 60px 20px',textAlign:'center' }}>
        <div style={{ fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:24 }}>Supported Books</div>
        <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
          {BOOKS.map(b=>(
            <div key={b} style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,padding:'8px 18px',fontSize:13,fontWeight:500 }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:BCOLORS[b],display:'inline-block' }} />{b}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:'60px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20,maxWidth:1100,margin:'0 auto' }}>
        {[
          {bg:'rgba(255,107,53,.15)',icon:'⚡',title:'Chapter-wise Practice',text:'Filter by book, chapter, difficulty and type. Practice exactly what you need.'},
          {bg:'rgba(124,111,247,.15)',icon:'🎯',title:'MCQ + MSQ + Numerical',text:'All JEE question types — single correct, multiple correct, and integer type.'},
          {bg:'rgba(34,197,94,.15)',icon:'📊',title:'Track Progress',text:'Accuracy per session, daily streaks and performance tracking.'},
          {bg:'rgba(59,130,246,.15)',icon:'🧠',title:'Detailed Solutions',text:'Step-by-step solutions after every attempt. Learn from mistakes.'},
        ].map((f,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'var(--r)',padding:28,transition:'all .25s',cursor:'default' }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.background='rgba(255,255,255,.08)';el.style.transform='translateY(-4px)';el.style.borderColor='rgba(124,111,247,.3)';}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.background='rgba(255,255,255,.04)';el.style.transform='translateY(0)';el.style.borderColor='rgba(255,255,255,.08)';}}
          >
            <div style={{ width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:16,background:f.bg }}>{f.icon}</div>
            <div style={{ fontSize:17,fontWeight:700,marginBottom:8,fontFamily:'Syne,sans-serif' }}>{f.title}</div>
            <div style={{ fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.7 }}>{f.text}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'32px 60px',borderTop:'1px solid rgba(255,255,255,.07)',textAlign:'center',fontSize:12,color:'rgba(255,255,255,.25)' }}>
        © 2026 JEEPrep · Built for JEE & NEET aspirants
      </div>
    </div>
  );
}
