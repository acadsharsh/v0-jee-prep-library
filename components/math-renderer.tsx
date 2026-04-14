'use client';
import { useEffect, useRef } from 'react';

interface MathRendererProps {
  children: string;
  display?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Renders a string that may contain LaTeX inline ($...$) and display ($$...$$) math
// Uses KaTeX loaded from CDN
export function MathText({ children, className, style }: { children: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    renderMath(ref.current, children);
  }, [children]);

  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={{ __html: processLatex(children) }} />;
}

// Parse and pre-render LaTeX segments as HTML spans
function processLatex(text: string): string {
  if (!text) return '';
  // Escape HTML first but preserve LaTeX
  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Display math: $$...$$
    if (text[i] === '$' && text[i + 1] === '$') {
      const end = text.indexOf('$$', i + 2);
      if (end !== -1) {
        const latex = text.slice(i + 2, end);
        result += `<span class="math-display" data-latex="${encodeURIComponent(latex)}" data-mode="display">[math]</span>`;
        i = end + 2;
        continue;
      }
    }
    // Inline math: $...$
    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1);
      if (end !== -1) {
        const latex = text.slice(i + 1, end);
        result += `<span class="math-inline" data-latex="${encodeURIComponent(latex)}" data-mode="inline">[math]</span>`;
        i = end + 1;
        continue;
      }
    }
    // Regular text — escape HTML
    const ch = text[i];
    if (ch === '<') result += '&lt;';
    else if (ch === '>') result += '&gt;';
    else if (ch === '&') result += '&amp;';
    else result += ch;
    i++;
  }
  return result;
}

function renderMath(container: HTMLElement, _text: string) {
  // Use KaTeX from window if loaded, otherwise load it
  const doRender = () => {
    const win = window as any;
    if (!win.katex) return;
    container.querySelectorAll('[data-latex]').forEach((el: Element) => {
      const span = el as HTMLSpanElement;
      const latex = decodeURIComponent(span.getAttribute('data-latex') ?? '');
      const mode = span.getAttribute('data-mode') === 'display';
      try {
        win.katex.render(latex, span, {
          displayMode: mode,
          throwOnError: false,
          output: 'html',
        });
      } catch (e) {
        span.textContent = latex;
      }
    });
  };

  if ((window as any).katex) {
    doRender();
  } else {
    // Load KaTeX CSS + JS from CDN
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('katex-js')) {
      const script = document.createElement('script');
      script.id = 'katex-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      script.onload = doRender;
      document.head.appendChild(script);
    }
  }
}

// Simple inline-only math renderer for options
export function MathInline({ children }: { children: string }) {
  return <MathText>{children}</MathText>;
}
