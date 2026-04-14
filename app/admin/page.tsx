'use client';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface Chapter { id: string; title: string; chapter_number: number; class_identifier: string; slug: string; }
interface Book { id: string; title: string; slug: string; subject: string | null; chapters: Chapter[]; }

const SUBJECTS = ['physics', 'chemistry', 'maths', 'biology'];
const CLASS_IDS = ['11', '12', 'common', '11_and_12'];

export default function AdminPage() {
  const { session } = useAuth();
  const { toast } = useToast();

  // Books/chapters state
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // Add book form
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSlug, setNewBookSlug] = useState('');
  const [newBookSubject, setNewBookSubject] = useState('physics');
  const [addingBook, setAddingBook] = useState(false);

  // Add chapter form
  const [addChapterFor, setAddChapterFor] = useState<string | null>(null);
  const [newChTitle, setNewChTitle] = useState('');
  const [newChNum, setNewChNum] = useState('');
  const [newChClass, setNewChClass] = useState('11');
  const [addingCh, setAddingCh] = useState(false);

  // Quiz upload state
  const [quizJson, setQuizJson] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };

  const fetchBooks = async () => {
    setBooksLoading(true);
    try {
      const res = await fetch('/api/books-admin');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setBooksLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const addBook = async () => {
    if (!newBookTitle.trim()) return;
    setAddingBook(true);
    try {
      const slug = newBookSlug || newBookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch('/api/books-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ action: 'add_book', title: newBookTitle, slug, subject: newBookSubject }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return; }
      toast({ title: 'Book added!', description: newBookTitle });
      setNewBookTitle(''); setNewBookSlug(''); setShowAddBook(false);
      fetchBooks();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setAddingBook(false); }
  };

  const addChapter = async (bookId: string) => {
    if (!newChTitle.trim() || !newChNum) return;
    setAddingCh(true);
    try {
      const res = await fetch('/api/books-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ action: 'add_chapter', bookId, title: newChTitle, chapterNumber: newChNum, classIdentifier: newChClass }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return; }
      toast({ title: 'Chapter added!', description: newChTitle });
      setNewChTitle(''); setNewChNum(''); setAddChapterFor(null);
      fetchBooks();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setAddingCh(false); }
  };

  const deleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Delete "${title}" and ALL its chapters + quizzes?`)) return;
    const res = await fetch('/api/books-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ action: 'delete_book', bookId }),
    });
    if (res.ok) { toast({ title: 'Deleted', description: title }); fetchBooks(); }
  };

  const deleteChapter = async (chapterId: string, title: string) => {
    if (!confirm(`Delete chapter "${title}"?`)) return;
    const res = await fetch('/api/books-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ action: 'delete_chapter', chapterId }),
    });
    if (res.ok) { toast({ title: 'Deleted', description: title }); fetchBooks(); }
  };

  const uploadQuiz = async () => {
    setUploading(true); setUploadResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const res = await fetch('/api/admin/upload-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizJson: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUploadResult({ type: 'success', msg: data.message || 'Uploaded!' });
      setQuizJson('');
      toast({ title: 'Uploaded!' });
    } catch (e: any) {
      setUploadResult({ type: 'error', msg: e.message });
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const SUBJ_COLORS: Record<string, string> = { physics: '#3d9eff', chemistry: '#0fd68a', maths: '#f5d90a', biology: '#ff6fd8' };

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#b06ef3' }} />
            <span className="neo-topbar-title">Admin</span>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* ── BOOKS & CHAPTERS ── */}
          <div style={{ marginBottom: 32 }}>
            <div className="neo-sec-head">
              <div className="neo-sec-title">Books & Chapters</div>
              <button onClick={() => setShowAddBook(!showAddBook)} className="neu-btn" style={{ fontSize: 12, padding: '8px 16px', background: showAddBook ? '#0a0a0a' : '#f5d90a', color: showAddBook ? '#f5d90a' : '#0a0a0a' }}>
                {showAddBook ? '✕ Cancel' : '+ Add Book'}
              </button>
            </div>

            {/* Add book form */}
            {showAddBook && (
              <div style={{ background: '#f5d90a', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>// ADD NEW BOOK</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>Title</div>
                    <input className="neu-input" placeholder="e.g. HC Verma" value={newBookTitle}
                      onChange={e => { setNewBookTitle(e.target.value); if (!newBookSlug) setNewBookSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>Slug</div>
                    <input className="neu-input" placeholder="hcv" value={newBookSlug} onChange={e => setNewBookSlug(e.target.value)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>Subject</div>
                    <select value={newBookSubject} onChange={e => setNewBookSubject(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '3px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <button onClick={addBook} disabled={addingBook || !newBookTitle.trim()} className="neu-btn neu-btn-black"
                    style={{ padding: '10px 20px', fontSize: 13, opacity: !newBookTitle.trim() ? 0.4 : 1 }}>
                    {addingBook ? '…' : 'Add →'}
                  </button>
                </div>
              </div>
            )}

            {/* Books list */}
            {booksLoading ? (
              <div style={{ padding: 32, textAlign: 'center', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#999' }}>Loading…</div>
            ) : books.length === 0 ? (
              <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 32, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>NO BOOKS YET</div>
                <div style={{ fontSize: 13, color: '#777' }}>Add your first book above.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', overflow: 'hidden' }}>
                {books.map((book, bi) => (
                  <div key={book.id} style={{ background: '#fff', borderBottom: bi < books.length - 1 ? '2px solid #eee' : 'none' }}>
                    {/* Book row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}
                      onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}>
                      <div style={{ width: 10, height: 10, background: SUBJ_COLORS[book.subject ?? ''] ?? '#ccc', border: '2px solid #0a0a0a', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{book.title}</div>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#999' }}>/{book.slug} · {book.chapters?.length ?? 0} chapters</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setAddChapterFor(addChapterFor === book.id ? null : book.id); setExpandedBook(book.id); }}
                        className="neu-btn" style={{ fontSize: 11, padding: '5px 12px', background: '#b8f72b' }}>+ Chapter</button>
                      <button onClick={e => { e.stopPropagation(); deleteBook(book.id, book.title); }}
                        style={{ fontSize: 11, padding: '5px 12px', background: '#ff4d4d', color: '#fff', border: '2px solid #0a0a0a', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 14, color: '#ccc' }}>{expandedBook === book.id ? '▲' : '▼'}</span>
                    </div>

                    {/* Add chapter form */}
                    {addChapterFor === book.id && (
                      <div style={{ background: '#f0f0f0', borderTop: '2px solid #eee', padding: '14px 18px' }}>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>// ADD CHAPTER TO {book.title.toUpperCase()}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace' }}>Chapter title</div>
                            <input className="neu-input" placeholder="e.g. Kinematics" value={newChTitle} onChange={e => setNewChTitle(e.target.value)} style={{ fontSize: 13 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace' }}>Ch. No.</div>
                            <input className="neu-input" type="number" placeholder="1" value={newChNum} onChange={e => setNewChNum(e.target.value)} style={{ fontSize: 13 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace' }}>Class</div>
                            <select value={newChClass} onChange={e => setNewChClass(e.target.value)}
                              style={{ width: '100%', padding: '10px 8px', border: '3px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, outline: 'none' }}>
                              {CLASS_IDS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <button onClick={() => addChapter(book.id)} disabled={addingCh || !newChTitle.trim() || !newChNum}
                            className="neu-btn neu-btn-black" style={{ padding: '10px 16px', fontSize: 12, opacity: !newChTitle.trim() || !newChNum ? 0.4 : 1 }}>
                            {addingCh ? '…' : 'Add'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Chapters list */}
                    {expandedBook === book.id && book.chapters?.length > 0 && (
                      <div style={{ borderTop: '2px solid #eee' }}>
                        {[...book.chapters].sort((a, b) => a.chapter_number - b.chapter_number).map((ch, ci, arr) => (
                          <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px 10px 36px', borderBottom: ci < arr.length - 1 ? '1px solid #f5f5f5' : 'none', background: '#fafafa' }}>
                            <div style={{ width: 32, height: 32, background: '#0a0a0a', color: '#f5d90a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {String(ch.chapter_number).padStart(2, '0')}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.title}</div>
                              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: '#999' }}>Class {ch.class_identifier} · {ch.slug}</div>
                            </div>
                            <button onClick={() => deleteChapter(ch.id, ch.title)}
                              style={{ fontSize: 10, padding: '3px 10px', background: '#fee2e2', color: '#ff4d4d', border: '2px solid #ff4d4d', cursor: 'pointer', fontWeight: 700 }}>✕ Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── QUIZ UPLOAD ── */}
          <div>
            <div className="neo-sec-head">
              <div className="neo-sec-title">Upload Practice Sets</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20 }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Paste JSON
                  {quizJson && (
                    <span style={{ padding: '2px 8px', background: isValid() ? '#b8f72b' : '#ff4d4d', border: '2px solid #0a0a0a', fontSize: 10, color: isValid() ? '#0a0a0a' : '#fff' }}>
                      {isValid() ? 'VALID' : 'INVALID'}
                    </span>
                  )}
                </div>
                <textarea value={quizJson} onChange={e => setQuizJson(e.target.value)} rows={14}
                  style={{ width: '100%', height: 220, padding: 12, border: `3px solid ${quizJson && !isValid() ? '#ff4d4d' : '#0a0a0a'}`, background: '#fff', fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#0a0a0a', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                  placeholder={'{\n  "quiz_title": "HCV Ch1 Objective",\n  "book_slug": "hcv",\n  "chapter_number": 1,\n  ...\n}'}
                />
                {uploadResult && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: uploadResult.type === 'success' ? '#b8f72b' : '#ff4d4d', border: '3px solid #0a0a0a', color: uploadResult.type === 'success' ? '#0a0a0a' : '#fff', fontSize: 13, fontWeight: 700 }}>
                    {uploadResult.msg}
                  </div>
                )}
                <button onClick={uploadQuiz} disabled={uploading || !quizJson || !isValid()}
                  className="neu-btn neu-btn-black" style={{ marginTop: 12, width: '100%', justifyContent: 'center', padding: 13, fontSize: 14, opacity: uploading || !quizJson ? 0.5 : 1 }}>
                  {uploading ? 'UPLOADING…' : 'UPLOAD QUIZ →'}
                </button>
              </div>

              <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20 }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>JSON Format</div>
                <pre style={{ background: '#111', color: '#f5d90a', padding: 14, fontSize: 11, lineHeight: 1.7, overflowY: 'auto', fontFamily: 'Space Mono,monospace', border: '3px solid #0a0a0a', maxHeight: 320, whiteSpace: 'pre-wrap' }}>
{`{
  "quiz_title": "HCV Ch1 — MCQ",
  "book_slug": "hcv",
  "book_title": "HC Verma",
  "class_identifier": "11",
  "chapter_number": 1,
  "chapter_title": "Rest & Motion",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "A body at rest...",
      "options": [
        {"id":"a","text":"Option A"},
        {"id":"b","text":"Option B"},
        {"id":"c","text":"Option C"},
        {"id":"d","text":"Option D"}
      ],
      "correctOptionId": "b",
      "explanation": "Because..."
    },
    {
      "id": "q2",
      "type": "numerical",
      "questionText": "Find the value...",
      "correctAnswer": 9.8,
      "tolerance": 0.1,
      "explanation": "g = 9.8 m/s²"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
