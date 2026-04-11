'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { toast } = useToast();

  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizJson: parsed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult({ type: 'success', message: data.message || 'Uploaded!' });
      setQuizJson('');
      toast({ title: 'Uploaded', description: data.message });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ background: 'var(--bg-0)', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx-1)' }}>Admin — Upload quiz</div>
        </div>

        <div style={{ padding: '24px 32px', maxWidth: 720 }}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>Quiz JSON</span>
              {quizJson && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: isValid() ? 'var(--green-dim)' : 'var(--red-dim)',
                  color: isValid() ? 'var(--green)' : 'var(--red)',
                }}>
                  {isValid() ? 'Valid' : 'Invalid JSON'}
                </span>
              )}
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={quizJson}
                  onChange={e => setQuizJson(e.target.value)}
                  rows={16}
                  required
                  placeholder={'{\n  "quiz_title": "...",\n  "book_slug": "hcv",\n  ...\n}'}
                  style={{
                    width: '100%', fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12.5, lineHeight: 1.65, resize: 'vertical',
                    borderColor: quizJson && !isValid() ? 'var(--red)' : undefined,
                  }}
                />
                {quizJson && (
                  <button onClick={() => setQuizJson('')} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'var(--bg-3)', border: '1px solid var(--border-mid)',
                    borderRadius: 4, padding: '3px 8px',
                    color: 'var(--tx-3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}>
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>

              {result && (
                <div style={{
                  marginTop: 12, padding: '9px 14px', borderRadius: 5,
                  background: result.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
                  border: `1px solid ${result.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: result.type === 'success' ? 'var(--green)' : 'var(--red)',
                }}>
                  {result.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {result.message}
                </div>
              )}

              <button onClick={handleSubmit as any} type="submit" disabled={isLoading || !quizJson || !isValid()} className="btn-acc"
                style={{ marginTop: 14, width: '100%', justifyContent: 'center', opacity: isLoading || !quizJson ? 0.5 : 1 }}>
                <Upload size={13} /> {isLoading ? 'Uploading…' : 'Upload quiz'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
