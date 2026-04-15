'use client';
import { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/navigation';

// Diagram tool categories
const TOOLS = {
  circuit: [
    { name: 'Falstad Circuit Simulator', desc: 'Build & simulate electrical circuits', url: 'https://www.falstad.com/circuit/circuitjs.html', icon: '⚡' },
    { name: 'Circuit Sandbox', desc: 'Simple circuit builder', url: 'https://circuitsandbox.net/', icon: '🔌' },
  ],
  graph: [
    { name: 'Desmos Graphing', desc: 'Plot any mathematical function', url: 'https://www.desmos.com/calculator', icon: '📈' },
    { name: 'Desmos 3D', desc: '3D surface and parametric plots', url: 'https://www.desmos.com/3d', icon: '🧊' },
    { name: 'Desmos Geometry', desc: 'Geometric constructions', url: 'https://www.desmos.com/geometry', icon: '△' },
    { name: 'GeoGebra', desc: 'Advanced math & science diagrams', url: 'https://www.geogebra.org/geometry', icon: '⊙' },
  ],
  phet: [
    { name: 'DC Circuits', desc: 'Build & test circuits', url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html', icon: '💡', subject: 'Physics' },
    { name: 'Wave on a String', desc: 'Wave properties & interference', url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html', icon: '〰', subject: 'Physics' },
    { name: 'Projectile Motion', desc: 'Trajectory & kinematics', url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html', icon: '🎯', subject: 'Physics' },
    { name: 'Coulomb\'s Law', desc: 'Electric force between charges', url: 'https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_en.html', icon: '⊕', subject: 'Physics' },
    { name: 'Acid-Base Solutions', desc: 'pH and equilibrium', url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html', icon: '🧪', subject: 'Chemistry' },
    { name: 'Balancing Equations', desc: 'Chemical equation balancing', url: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html', icon: '⚖', subject: 'Chemistry' },
    { name: 'Build an Atom', desc: 'Atomic structure builder', url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html', icon: '⚛', subject: 'Chemistry' },
    { name: 'Graphing Quadratics', desc: 'Parabola explorer', url: 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_en.html', icon: '∪', subject: 'Maths' },
    { name: 'Trig Tour', desc: 'Unit circle & trig functions', url: 'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_en.html', icon: '🔄', subject: 'Maths' },
  ],
  draw: [
    { name: 'Excalidraw', desc: 'Sketch diagrams for physics problems (electric field lines, free body, ray diagrams)', url: 'https://excalidraw.com/', icon: '✏', embed: true },
    { name: 'tldraw', desc: 'Infinite canvas for drawing & diagramming', url: 'https://www.tldraw.com/', icon: '🖊' },
    { name: 'Draw.io', desc: 'Professional diagram editor', url: 'https://app.diagrams.net/', icon: '◻' },
  ],
};

export default function DiagramPage() {
  const [activeTab, setActiveTab] = useState<'draw' | 'circuit' | 'graph' | 'phet'>('draw');
  const [activeUrl, setActiveUrl] = useState(TOOLS.draw[0].url);
  const [fullscreen, setFullscreen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('All');

  const tabs = [
    { key: 'draw', label: '✏ Draw', desc: 'Sketch question diagrams' },
    { key: 'circuit', label: '⚡ Circuit', desc: 'Simulate circuits' },
    { key: 'graph', label: '📈 Graph', desc: 'Plot functions' },
    { key: 'phet', label: '🔬 PhET Sims', desc: 'Interactive simulations' },
  ] as const;

  const currentTools = TOOLS[activeTab] ?? [];
  const filtered = activeTab === 'phet' && subjectFilter !== 'All'
    ? (currentTools as any[]).filter(t => t.subject === subjectFilter)
    : currentTools;

  return (
    <div className="app-shell">
      <Navigation />
      <div className="main-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Diagram Lab</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Draw physics diagrams, simulate circuits, plot graphs</div>
          </div>
          <div className="topbar-right">
            <button onClick={() => setFullscreen(!fullscreen)} className="btn-ghost" style={{ fontSize: 12 }}>
              {fullscreen ? '⊡ Show Panel' : '⊞ Fullscreen'}
            </button>
            <a href={activeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 12 }}>↗ Open new tab</a>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setActiveUrl(TOOLS[t.key][0].url); }}
              className={`chip ${activeTab === t.key ? 'active' : ''}`} style={{ whiteSpace: 'nowrap', padding: '7px 16px' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Sidebar */}
          {!fullscreen && (
            <div style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Description */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
                  {activeTab === 'draw' && '✏ Draw electric field lines, free-body diagrams, ray diagrams, and physics problem sketches.'}
                  {activeTab === 'circuit' && '⚡ Build and simulate electrical circuits with resistors, capacitors, and inductors.'}
                  {activeTab === 'graph' && '📈 Plot mathematical functions, parametric equations, and geometric constructions.'}
                  {activeTab === 'phet' && '🔬 Interactive physics & chemistry simulations from University of Colorado.'}
                </div>
              </div>

              {activeTab === 'phet' && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
                  {['All', 'Physics', 'Chemistry', 'Maths'].map(s => (
                    <button key={s} onClick={() => setSubjectFilter(s)} className={`chip ${subjectFilter === s ? 'active' : ''}`} style={{ fontSize: 10, padding: '4px 10px' }}>{s}</button>
                  ))}
                </div>
              )}

              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {filtered.map((tool: any, i: number) => (
                  <button key={i} onClick={() => setActiveUrl(tool.url)} style={{
                    width: '100%', padding: '10px 12px', marginBottom: 4, textAlign: 'left',
                    background: activeUrl === tool.url ? 'rgba(245,200,66,0.1)' : 'transparent',
                    border: `1px solid ${activeUrl === tool.url ? 'rgba(245,200,66,0.3)' : 'transparent'}`,
                    borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.12s',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{tool.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: activeUrl === tool.url ? 'var(--yellow)' : 'var(--text)', marginBottom: 2 }}>{tool.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--faint)', lineHeight: 1.5 }}>{tool.desc}</div>
                        {tool.subject && <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tool.subject}</div>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tips */}
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'rgba(245,200,66,0.04)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>💡 JEE Diagram Tips</div>
                {activeTab === 'draw' && [
                  'Use Excalidraw for electric field lines',
                  'Draw free-body diagrams for mechanics',
                  'Sketch ray diagrams for optics',
                  'Use shapes library for quick diagrams',
                ].map((tip, i) => <div key={i} style={{ fontSize: 10, color: 'var(--faint)', marginBottom: 3 }}>• {tip}</div>)}
                {activeTab === 'circuit' && [
                  'R = resistor, C = capacitor, L = inductor',
                  'Right-click component to edit values',
                  'Space = pause simulation',
                  'Check voltage/current probes',
                ].map((tip, i) => <div key={i} style={{ fontSize: 10, color: 'var(--faint)', marginBottom: 3 }}>• {tip}</div>)}
                {activeTab === 'graph' && [
                  'Type sin(x), cos(x), tan(x) directly',
                  'Use sliders: type a=1 for a slider',
                  'Implicit: x^2 + y^2 = r^2 for circle',
                  'Derivative: d/dx f(x)',
                ].map((tip, i) => <div key={i} style={{ fontSize: 10, color: 'var(--faint)', marginBottom: 3 }}>• {tip}</div>)}
              </div>
            </div>
          )}

          {/* Main iframe */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
            <iframe key={activeUrl} src={activeUrl} style={{ flex: 1, border: 'none', width: '100%', minHeight: 0 }} allow="fullscreen clipboard-read clipboard-write" title="Diagram tool" />
          </div>
        </div>
      </div>
    </div>
  );
}
