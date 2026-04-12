'use client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Star } from 'lucide-react';

function Ticker({ text, color, bg, border, reverse }: { text:string; color:string; bg:string; border:string; reverse?:boolean }) {
  const items = Array(14).fill(null);
  return (
    <div className="ticker-wrap" style={{ borderColor:border, background:bg }}>
      <div className={`ticker-track${reverse?' reverse':''}`}>
        {[...items,...items].map((_,i) => (
          <span key={i} className="ticker-item" style={{ color }}>{text} <span style={{ opacity:0.35, fontSize:12 }}>★</span></span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { color:'#FFD23F', text:'#0d0d0d', icon:'📖', title:'Chapter-wise Practice', desc:'HCV, Irodov and more. Organized by book, class and chapter.' },
  { color:'#7C5CBF', text:'#ffffff', icon:'📊', title:'Live Analytics', desc:'Your accuracy per chapter. Know exactly what needs work.' },
  { color:'#FF5252', text:'#ffffff', icon:'⚡', title:'Instant Explanations', desc:'Every question explained. Learn from every wrong answer.' },
  { color:'#4CAF7D', text:'#0d0d0d', icon:'🎯', title:'JEE-level MCQs', desc:'All question types from actual JEE papers, in one place.' },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div style={{ background:'#0d0d0d', minHeight:'100vh' }}>
      <Navigation />

      {/* Hero */}
      <section style={{ paddingTop:140, paddingBottom:80, paddingLeft:48, paddingRight:48, position:'relative', overflow:'hidden' }}>
        {/* Glows */}
        <div style={{ position:'absolute', top:80, right:80, width:360, height:360, borderRadius:'50%', background:'rgba(124,92,191,0.18)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:60, width:240, height:240, borderRadius:'50%', background:'rgba(255,210,63,0.12)', filter:'blur(60px)', pointerEvents:'none' }} />
        {/* Floaties */}
        <div style={{ position:'absolute', top:120, right:160, fontSize:56, transform:'rotate(12deg)', pointerEvents:'none' }}>📚</div>
        <div style={{ position:'absolute', top:240, right:60, fontSize:44, transform:'rotate(-8deg)', pointerEvents:'none' }}>⚡</div>
        <div style={{ position:'absolute', bottom:110, right:280, fontSize:48, transform:'rotate(6deg)', pointerEvents:'none' }}>🎯</div>
        <div style={{ position:'absolute', top:180, left:'56%', fontSize:40, transform:'rotate(-5deg)', pointerEvents:'none' }}>🚀</div>

        <div style={{ maxWidth:700, position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, background:'rgba(255,210,63,0.12)', border:'1px solid rgba(255,210,63,0.3)', marginBottom:32 }}>
            <Star size={11} color="#FFD23F" fill="#FFD23F" />
            <span style={{ fontSize:11, fontWeight:800, color:'#FFD23F', letterSpacing:'0.08em', textTransform:'uppercase' }}>JEE Advanced 2026 Prep</span>
          </div>

          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:'clamp(52px,7.5vw,90px)', lineHeight:0.93, letterSpacing:'-2.5px', color:'#ffffff', marginBottom:10 }}>CREATE NEW</h1>
          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:'clamp(52px,7.5vw,90px)', lineHeight:0.93, letterSpacing:'-2.5px', color:'#FFD23F', marginBottom:10 }}>EXPERIENCE</h1>
          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:'clamp(52px,7.5vw,90px)', lineHeight:0.93, letterSpacing:'-2.5px', color:'#ffffff', marginBottom:40 }}>WITH JEE PREP.</h1>

          <p style={{ fontSize:17, color:'rgba(255,255,255,0.55)', maxWidth:480, lineHeight:1.8, marginBottom:44 }}>
            Chapter-wise practice from HCV, Irodov &amp; more. Track your accuracy, fix weak spots, and climb the rank list.
          </p>

          {!loading && (
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {user ? (
                <button onClick={() => router.push('/dashboard')} className="btn-yellow">
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button onClick={() => router.push('/signup')} className="btn-yellow" style={{ boxShadow:'0 8px 32px rgba(255,210,63,0.3)' }}>
                    Start for free <ArrowRight size={16} />
                  </button>
                  <button onClick={() => router.push('/login')} className="btn-ghost">
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Ticker text="JEE ADVANCED 2026" color="#0d0d0d" bg="#FFD23F" border="#FFD23F" />

      {/* Features */}
      <section style={{ padding:'72px 48px' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#7C5CBF', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>What you get</div>
          <h2 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:40, color:'#ffffff', letterSpacing:'-0.8px' }}>
            BUILT FOR{' '}
            <span style={{ background:'#7C5CBF', color:'#fff', padding:'2px 16px', borderRadius:8, display:'inline-block' }}>JEE</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:16 }}>
          {FEATURES.map((c,i) => (
            <div key={i} style={{ background:c.color, borderRadius:20, padding:'28px 24px', display:'flex', flexDirection:'column', gap:14, cursor:'default', transition:'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform='translateY(-5px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform='translateY(0)'}
            >
              <div style={{ fontSize:42 }}>{c.icon}</div>
              <div style={{ fontSize:18, fontWeight:900, color:c.text, fontFamily:'Space Grotesk,sans-serif', lineHeight:1.2 }}>{c.title}</div>
              <div style={{ fontSize:13, color:c.text, opacity:0.68, lineHeight:1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Ticker text="PHYSICS · CHEMISTRY · MATHEMATICS · MCQ · MSQ · NUMERICAL" color="#ffffff" bg="#7C5CBF" border="#7C5CBF" reverse />

      {/* CTA */}
      <section style={{ padding:'72px 48px 88px' }}>
        <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'56px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(124,92,191,0.2)', filter:'blur(60px)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:36, color:'#ffffff', marginBottom:10, letterSpacing:'-0.5px' }}>
              LET&apos;S UNLOCK<br />YOUR POTENTIAL.
            </div>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)' }}>Start practicing today. See your progress. Ace JEE.</p>
          </div>
          {!loading && !user && (
            <button onClick={() => router.push('/signup')} className="btn-yellow" style={{ fontSize:15, padding:'16px 36px', boxShadow:'0 8px 32px rgba(255,210,63,0.25)' }}>
              Get started free →
            </button>
          )}
        </div>
      </section>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:14, color:'#FFD23F' }}>JEEPrep</span>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>© 2026 All rights reserved</span>
      </div>
    </div>
  );
}
