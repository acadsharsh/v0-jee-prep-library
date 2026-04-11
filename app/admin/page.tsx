'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, CheckCircle, AlertCircle, FileJson, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [quizJson, setQuizJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizJson: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload quiz');
      setResult({ type: 'success', message: data.message || 'Quiz uploaded!' });
      setQuizJson('');
      toast({ title: 'Uploaded!', description: data.message });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message || 'Failed to upload quiz' });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidJson = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Header */}
          <div className="animate-fade-up" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color="#8b5cf6" />
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#f0f2f7', letterSpacing: '-0.4px' }}>
                Admin panel
              </h1>
            </div>
            <p style={{ color: '#8b92a5', fontSize: 14, marginLeft: 54 }}>Upload quiz JSON content to the database</p>
          </div>

          {/* Upload card */}
          <div className="animate-fade-up" style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 28,
            animationDelay: '0.06s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FileJson size={16} color="#4f8ef7" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f2f7' }}>
                Quiz JSON
              </span>
              {quizJson && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 6,
                  background: isValidJson() ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isValidJson() ? '#22c55e' : '#ef4444',
                }}>
                  {isValidJson() ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <textarea
                  value={quizJson}
                  onChange={e => setQuizJson(e.target.value)}
                  placeholder={`{\n  "quiz_title": "HCV Chapter 1 - Rest and Motion",\n  "book_slug": "hcv",\n  "class_identifier": "11",\n  "chapter_number": 1,\n  "chapter_slug": "rest-and-motion",\n  "questions": [...]\n}`}
                  rows={18}
                  required
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: 10,
                    border: `1px solid ${quizJson && !isValidJson() ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    background: 'rgba(255,255,255,0.02)',
                    color: '#d0d4e0', fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.6, resize: 'vertical', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { if (isValidJson() || !quizJson) e.target.style.borderColor = 'rgba(79,142,247,0.5)'; }}
                  onBlur={e => e.target.style.borderColor = quizJson && !isValidJson() ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}
                />
                {quizJson && (
                  <button type="button" onClick={() => setQuizJson('')} style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, padding: '4px 8px',
                    color: '#8b92a5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                  }}>
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>

              {result && (
                <div style={{
                  padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                  background: result.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${result.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {result.type === 'success'
                    ? <CheckCircle size={16} color="#22c55e" />
                    : <AlertCircle size={16} color="#ef4444" />}
                  <span style={{ fontSize: 13, color: result.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    {result.message}
                  </span>
                </div>
              )}

              <button type="submit" disabled={isLoading || !quizJson} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '13px',
                borderRadius: 10,
                background: isLoading || !quizJson ? 'rgba(79,142,247,0.3)' : '#4f8ef7',
                border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: isLoading || !quizJson ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif',
                boxShadow: !isLoading && quizJson ? '0 0 24px rgba(79,142,247,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                <Upload size={15} />
                {isLoading ? 'Uploading…' : 'Upload quiz'}
              </button>
            </form>
          </div>

          {/* Format hint */}
          <div className="animate-fade-up" style={{
            marginTop: 16,
            padding: '14px 18px',
            borderRadius: 10,
            background: 'rgba(79,142,247,0.05)',
            border: '1px solid rgba(79,142,247,0.12)',
            animationDelay: '0.12s',
          }}>
            <p style={{ fontSize: 12, color: '#8b92a5', lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: '#4f8ef7', fontWeight: 700 }}>Format: </span>
              Each question must have <code style={{ color: '#d0d4e0', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>id</code>, <code style={{ color: '#d0d4e0', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>questionText</code>, <code style={{ color: '#d0d4e0', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>options</code> (array with id+text), <code style={{ color: '#d0d4e0', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>correctOptionId</code>, and optionally <code style={{ color: '#d0d4e0', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>explanation</code>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
