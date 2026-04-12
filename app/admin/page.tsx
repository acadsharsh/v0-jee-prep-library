'use client';
import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { toast } = useToast();

  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizJson: parsed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult({ type: 'success', message: data.message || 'Uploaded!' });
      setQuizJson('');
      toast({ title: 'Uploaded!', description: data.message });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navigation />
      <main style={{ background: '#f4f5fb', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e8f0', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#7b6cf6" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 20, color: '#1e1e2d' }}>Admin Panel</h1>
            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>Upload quiz content to the database</div>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: 720 }}>
          <div className="d-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, color: '#1e1e2d' }}>Quiz JSON</span>
              {quizJson && (
                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: isValid() ? '#d1fae5' : '#fee2e2', color: isValid() ? '#059669' : '#ef4444' }}>
                  {isValid() ? '✓ Valid' : '✗ Invalid JSON'}
                </span>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <textarea value={quizJson} onChange={e => setQuizJson(e.target.value)} rows={16} required
                placeholder={'{\n  "quiz_title": "HCV Ch1 — Objective",\n  "book_slug": "hcv",\n  "class_identifier": "11",\n  "chapter_number": 1,\n  "chapter_title": "Introduction to Physics",\n  "questions": [...]\n}'}
                style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5, lineHeight: 1.7, resize: 'vertical', borderColor: quizJson && !isValid() ? '#fca5a5' : '#e8e8f0' }} />
              {quizJson && (
                <button onClick={() => setQuizJson('')} style={{
                  position: 'absolute', top: 10, right: 10,
                  background: '#f4f5fb', border: '1px solid #e8e8f0', borderRadius: 8,
                  color: '#9ca3af', cursor: 'pointer', padding: '4px 10px',
                  fontSize: 11, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>

            {result && (
              <div style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 14, background: result.type === 'success' ? '#d1fae5' : '#fee2e2', color: result.type === 'success' ? '#059669' : '#ef4444', fontSize: 13, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                {result.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {result.message}
              </div>
            )}

            <button onClick={submit as any} disabled={loading || !quizJson || !isValid()} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: loading || !quizJson ? 0.5 : 1 }}>
              <Upload size={14} /> {loading ? 'Uploading…' : 'Upload quiz'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
