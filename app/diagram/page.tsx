'use client';
import { useState, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import Link from 'next/link';

const CIRCUIT_TEMPLATES = [
  { name: 'RC Circuit', desc: 'Resistor + Capacitor in series', url: 'https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA2ATmIxAUgoqoQFMBaMMAKADcQaWKV8BeS27xHD5eOKCEoB3dhFJi+UmUICGIAGYBXAE4AXbgHc5OgmODCFSGVBbJqQvQDsIACyMBjNiTZjU1EAA2AG5nSQ0HZ2EgA' },
  { name: 'LCR Circuit', desc: 'Inductor, Capacitor, Resistor', url: 'https://www.falstad.com/circuit/circuitjs.html' },
  { name: 'Wheatstone Bridge', desc: 'Classic bridge circuit', url: 'https://www.falstad.com/circuit/circuitjs.html' },
  { name: 'Blank Canvas', desc: 'Start from scratch', url: 'https://www.falstad.com/circuit/circuitjs.html' },
];

const PHET_SIMS = [
  { name: 'Circuit Construction Kit', subject: 'Physics', url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html', color: '#3d9eff' },
  { name: 'Wave on a String', subject: 'Physics', url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html', color: '#3d9eff' },
  { name: 'Projectile Motion', subject: 'Physics', url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html', color: '#3d9eff' },
  { name: 'Acid-Base Solutions', subject: 'Chemistry', url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html', color: '#0fd68a' },
  { name: 'Balancing Chemical Equations', subject: 'Chemistry', url: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html', color: '#0fd68a' },
  { name: 'Build an Atom', subject: 'Chemistry', url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html', color: '#0fd68a' },
  { name: 'Graphing Quadratics', subject: 'Maths', url: 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_en.html', color: '#f5d90a' },
  { name: 'Trig Tour', subject: 'Maths', url: 'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_en.html', color: '#f5d90a' },
];

export default function DiagramPage() {
  const [activeTab, setActiveTab] = useState<'circuit' | 'phet' | 'desmos'>('circuit');
  const [activeUrl, setActiveUrl] = useState(CIRCUIT_TEMPLATES[3].url);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const SUBJ_COLORS: Record<string, string> = { Physics: '#3d9eff', Chemistry: '#0fd68a', Maths: '#f5d90a' };

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#3d9eff' }} />
            <span className="neo-topbar-title">Lab & Diagrams</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['circuit', 'phet', 'desmos'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`neo-chip ${activeTab === t ? 'active' : ''}`} style={{ fontSize: 11, textTransform: 'uppercase' }}>
                {t === 'circuit' ? '⚡ Circuit' : t === 'phet' ? '🔬 PhET Sims' : '📈 Desmos'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 'calc(100vh - 60px)' }}>
          {/* Sidebar */}
          {!isFullscreen && (
            <div style={{ width: 220, background: '#fafafa', borderRight: '3px solid #0a0a0a', overflow: 'y', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'circuit' && (
                <div style={{ padding: 14 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// TEMPLATES</div>
                  {CIRCUIT_TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => setActiveUrl(t.url)} style={{
                      width: '100%', padding: '10px 12px', marginBottom: 6, textAlign: 'left',
                      background: activeUrl === t.url ? '#f5d90a' : '#fff',
                      border: `2px solid ${activeUrl === t.url ? '#0a0a0a' : '#ddd'}`,
                      boxShadow: activeUrl === t.url ? '2px 2px 0 #0a0a0a' : 'none',
                      cursor: 'pointer', transition: 'all 0.1s',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: '#777' }}>{t.desc}</div>
                    </button>
                  ))}
                  <div style={{ marginTop: 16, padding: '12px', background: '#111', border: '2px solid #333' }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#f5d90a', fontWeight: 700, marginBottom: 8 }}>CIRCUIT TIPS</div>
                    {[
                      'R = drag resistor from menu',
                      'W = wire tool',
                      'Right-click = component properties',
                      'Space = pause/play simulation',
                    ].map((tip, i) => (
                      <div key={i} style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>• {tip}</div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'phet' && (
                <div style={{ padding: 14, overflowY: 'auto' }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// SIMULATIONS</div>
                  {['Physics', 'Chemistry', 'Maths'].map(subj => (
                    <div key={subj} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, background: SUBJ_COLORS[subj] }} />
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#777', textTransform: 'uppercase' }}>{subj}</div>
                      </div>
                      {PHET_SIMS.filter(s => s.subject === subj).map((s, i) => (
                        <button key={i} onClick={() => setActiveUrl(s.url)} style={{
                          width: '100%', padding: '8px 10px', marginBottom: 5, textAlign: 'left',
                          background: activeUrl === s.url ? SUBJ_COLORS[subj] : '#fff',
                          border: `2px solid ${activeUrl === s.url ? '#0a0a0a' : '#ddd'}`,
                          boxShadow: activeUrl === s.url ? '2px 2px 0 #0a0a0a' : 'none',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'desmos' && (
                <div style={{ padding: 14 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 12 }}>// GRAPHING TOOLS</div>
                  {[
                    { name: 'Graphing Calculator', url: 'https://www.desmos.com/calculator', desc: 'Plot any function' },
                    { name: 'Geometry', url: 'https://www.desmos.com/geometry', desc: 'Draw geometric shapes' },
                    { name: '3D Calculator', url: 'https://www.desmos.com/3d', desc: '3D surface plots' },
                    { name: 'Scientific Calculator', url: 'https://www.desmos.com/scientific', desc: 'Advanced calculator' },
                  ].map((t, i) => (
                    <button key={i} onClick={() => setActiveUrl(t.url)} style={{
                      width: '100%', padding: '10px 12px', marginBottom: 6, textAlign: 'left',
                      background: activeUrl === t.url ? '#f5d90a' : '#fff',
                      border: `2px solid ${activeUrl === t.url ? '#0a0a0a' : '#ddd'}`,
                      boxShadow: activeUrl === t.url ? '2px 2px 0 #0a0a0a' : 'none',
                      cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: '#777' }}>{t.desc}</div>
                    </button>
                  ))}
                  <div style={{ marginTop: 14, padding: 12, background: '#111', border: '2px solid #333' }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#f5d90a', fontWeight: 700, marginBottom: 6 }}>DESMOS TIPS</div>
                    <div style={{ fontSize: 10, color: '#666', lineHeight: 1.7 }}>
                      Type <span style={{ color: '#f5d90a' }}>sin(x)</span>, <span style={{ color: '#f5d90a' }}>x^2</span>, <span style={{ color: '#f5d90a' }}>|x|</span><br />
                      Use sliders with <span style={{ color: '#f5d90a' }}>a=1</span><br />
                      Implicit curves: <span style={{ color: '#f5d90a' }}>x^2+y^2=1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main iframe area */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#0a0a0a', borderBottom: '2px solid #222' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeUrl}
              </div>
              <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ padding: '5px 12px', background: isFullscreen ? '#f5d90a' : '#222', color: isFullscreen ? '#0a0a0a' : '#777', border: `2px solid ${isFullscreen ? '#f5d90a' : '#444'}`, cursor: 'pointer', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700 }}>
                {isFullscreen ? '⊡ PANEL' : '⊞ FULL'}
              </button>
              <a href={activeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 12px', background: '#222', color: '#777', border: '2px solid #444', cursor: 'pointer', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                ↗ OPEN
              </a>
            </div>

            <iframe
              ref={iframeRef}
              src={activeUrl}
              style={{ flex: 1, border: 'none', width: '100%' }}
              allow="fullscreen"
              title="Lab tool"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
