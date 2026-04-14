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

  const [activeTab, setActiveTab] = useState<'books' | 'upload'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // Add book
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSlug, setNewBookSlug] = useState('');
  const [newBookSubject, setNewBookSubject] = useState('physics');
  const [addingBook, setAddingBook] = useState(false);

  // Add chapter
  const [addChapterFor, setAddChapterFor] = useState<string | null>(null);
  const [newChTitle, setNewChTitle] = useState('');
  const [newChNum, setNewChNum] = useState('');
  const [newChClass, setNewChClass] = useState('11');
  const [addingCh, setAddingCh] = useState(false);

  // Upload quiz
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [quizJson, setQuizJson] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Existing quizzes for selected chapter
  const [existingQuizzes, setExistingQuizzes] = useState<Array<{ id: string; title: string; difficulty: string | null }>>([]);

  const isValid = () => { try { JSON.parse(quizJson); return true; } catch { return false; } };
  const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const fetchBooks = async () => {
    setBooksLoading(true);
    try {
      const res = await fetch('/api/books-admin/chapters');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setBooksLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // When chapter selected, fetch existing quizzes for it
  useEffect(() => {
    if (!selectedChapterId) { setExistingQuizzes([]); return; }
    fetch(`/api/quizzes/${selectedChapterId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setExistingQuizzes(Array.isArray(data) ? data.map((q: any) => ({ id: q.id, title: q.title, difficulty: q.difficulty })) : []))
      .catch(() => setExistingQuizzes([]));
  }, [selectedChapterId]);

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedChapters = selectedBook?.chapters ?? [];

  const addBook = async () => {
    if (!newBookTitle.trim()) return;
    setAddingBook(true);
    try {
      const slug = newBookSlug.trim() || newBookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch('/api/books-admin', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ action: 'add_book', title: newBookTitle, slug, subject: newBookSubject }) });
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
      const res = await fetch('/api/books-admin', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ action: 'add_chapter', bookId, title: newChTitle, chapterNumber: newChNum, classIdentifier: newChClass }) });
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
    const res = await fetch('/api/books-admin', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ action: 'delete_book', bookId }) });
    if (res.ok) { toast({ title: 'Deleted', description: title }); fetchBooks(); }
  };

  const deleteChapter = async (chapterId: string, title: string) => {
    if (!confirm(`Delete chapter "${title}"?`)) return;
    const res = await fetch('/api/books-admin', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ action: 'delete_chapter', chapterId }) });
    if (res.ok) { toast({ title: 'Deleted', description: title }); fetchBooks(); }
  };

  const uploadQuiz = async () => {
    if (!quizJson.trim() || !isValid()) return;
    setUploading(true); setUploadResult(null);
    try {
      const parsed = JSON.parse(quizJson);
      const body: any = { quizJson: parsed };
      if (selectedChapterId) body.targetChapterId = selectedChapterId;

      const res = await fetch('/api/admin/upload-quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUploadResult({ type: 'success', msg: data.message });
      setQuizJson('');
      toast({ title: 'Uploaded!', description: data.message });
      // Refresh existing quizzes
      if (selectedChapterId) {
        fetch(`/api/quizzes/${selectedChapterId}`).then(r => r.ok ? r.json() : []).then(data => setExistingQuizzes(Array.isArray(data) ? data.map((q: any) => ({ id: q.id, title: q.title, difficulty: q.difficulty })) : []));
      }
    } catch (e: any) { setUploadResult({ type: 'error', msg: e.message }); }
    finally { setUploading(false); }
  };

  const SUBJ_COLORS: Record<string, string> = { physics: '#3d9eff', chemistry: '#0fd68a', maths: '#f5d90a', biology: '#ff6fd8' };

  const sStr = (s: string) => { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); };

  return (
    <div className="neo-shell">
      <Navigation />
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 22, background: '#b06ef3' }} />
            <span className="neo-topbar-title">Admin Panel</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['books', 'upload'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`neo-chip ${activeTab === t ? 'active' : ''}`} style={{ fontSize: 11 }}>
                {t === 'books' ? '📚 Books & Chapters' : '⬆ Upload Quiz'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* ── BOOKS & CHAPTERS TAB ── */}
          {activeTab === 'books' && (
            <div>
              <div className="neo-sec-head">
                <div className="neo-sec-title">Books & Chapters</div>
                <button onClick={() => setShowAddBook(!showAddBook)} className="neu-btn" style={{ fontSize: 12, padding: '8px 16px', background: showAddBook ? '#0a0a0a' : '#f5d90a', color: showAddBook ? '#f5d90a' : '#0a0a0a' }}>
                  {showAddBook ? '✕ Cancel' : '+ New Book'}
                </button>
              </div>

              {showAddBook && (
                <div style={{ background: '#f5d90a', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20, marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>// ADD NEW BOOK</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>Book Title</div>
                      <input className="neu-input" placeholder="e.g. HC Verma Vol 1" value={newBookTitle}
                        onChange={e => { setNewBookTitle(e.target.value); setNewBookSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>URL Slug</div>
                      <input className="neu-input" placeholder="hcv" value={newBookSlug} onChange={e => setNewBookSlug(e.target.value)} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'Space Mono,monospace' }}>Subject</div>
                      <select value={newBookSubject} onChange={e => setNewBookSubject(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '3px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                        {SUBJECTS.map(s => <option key={s} value={s}>{sStr(s)}</option>)}
                      </select>
                    </div>
                    <button onClick={addBook} disabled={addingBook || !newBookTitle.trim()} className="neu-btn neu-btn-black" style={{ padding: '10px 20px', fontSize: 13, opacity: !newBookTitle.trim() ? 0.4 : 1 }}>
                      {addingBook ? '…' : 'Add →'}
                    </button>
                  </div>
                </div>
              )}

              {booksLoading ? (
                <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#999' }}>Loading…</div>
              ) : books.length === 0 ? (
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', padding: 40, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 32, color: '#eee', marginBottom: 12 }}>📚</div>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>NO BOOKS YET</div>
                  <div style={{ fontSize: 13, color: '#777' }}>Click "New Book" above to add your first book.</div>
                </div>
              ) : (
                <div style={{ border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', overflow: 'hidden' }}>
                  {books.map((book, bi) => (
                    <div key={book.id} style={{ background: '#fff', borderBottom: bi < books.length - 1 ? '2px solid #eee' : 'none' }}>
                      {/* Book row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}>
                        <div style={{ width: 12, height: 12, background: SUBJ_COLORS[book.subject ?? ''] ?? '#ccc', border: '2px solid #0a0a0a', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{book.title}</div>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#999', marginTop: 2 }}>/{book.slug} · {book.chapters?.length ?? 0} chapters · {sStr(book.subject ?? '')}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setAddChapterFor(addChapterFor === book.id ? null : book.id); setExpandedBook(book.id); }}
                          style={{ padding: '6px 14px', background: '#b8f72b', border: '2px solid #0a0a0a', boxShadow: '2px 2px 0 #0a0a0a', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>+ Chapter</button>
                        <button onClick={e => { e.stopPropagation(); deleteBook(book.id, book.title); }}
                          style={{ padding: '6px 12px', background: '#ff4d4d', color: '#fff', border: '2px solid #0a0a0a', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>✕</button>
                        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 14, color: '#bbb', marginLeft: 4 }}>{expandedBook === book.id ? '▲' : '▼'}</span>
                      </div>

                      {/* Add chapter inline form */}
                      {addChapterFor === book.id && (
                        <div style={{ background: '#f8f8f8', borderTop: '2px solid #eee', padding: '14px 20px 14px 44px' }}>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777', marginBottom: 10 }}>+ ADD CHAPTER TO {book.title.toUpperCase()}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px auto', gap: 8, alignItems: 'end' }}>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace', color: '#999' }}>Chapter Title</div>
                              <input className="neu-input" placeholder="e.g. Kinematics" value={newChTitle} onChange={e => setNewChTitle(e.target.value)} style={{ fontSize: 13 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace', color: '#999' }}>No.</div>
                              <input className="neu-input" type="number" placeholder="1" min="1" value={newChNum} onChange={e => setNewChNum(e.target.value)} style={{ fontSize: 13 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Space Mono,monospace', color: '#999' }}>Class</div>
                              <select value={newChClass} onChange={e => setNewChClass(e.target.value)}
                                style={{ width: '100%', padding: '10px 8px', border: '3px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, outline: 'none' }}>
                                {CLASS_IDS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <button onClick={() => addChapter(book.id)} disabled={addingCh || !newChTitle.trim() || !newChNum} className="neu-btn neu-btn-black" style={{ padding: '10px 16px', fontSize: 12 }}>
                              {addingCh ? '…' : 'Add'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Chapters list */}
                      {expandedBook === book.id && (
                        <div style={{ borderTop: '2px solid #f0f0f0' }}>
                          {book.chapters?.length === 0 ? (
                            <div style={{ padding: '16px 44px', fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#bbb' }}>No chapters yet — click "+ Chapter" to add one.</div>
                          ) : (
                            [...(book.chapters ?? [])].sort((a, b) => a.chapter_number - b.chapter_number).map((ch, ci, arr) => (
                              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 44px', borderBottom: ci < arr.length - 1 ? '1px solid #f5f5f5' : 'none', background: '#fafafa' }}>
                                <div style={{ width: 34, height: 34, background: '#0a0a0a', color: '#f5d90a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                  {String(ch.chapter_number).padStart(2, '0')}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.title}</div>
                                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: '#bbb', marginTop: 1 }}>Class {ch.class_identifier} · {ch.slug}</div>
                                </div>
                                <button onClick={() => deleteChapter(ch.id, ch.title)} style={{ fontSize: 10, padding: '4px 10px', background: '#fee2e2', color: '#ff4d4d', border: '2px solid #ff4d4d', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── UPLOAD QUIZ TAB ── */}
          {activeTab === 'upload' && (
            <div>
              <div className="neo-sec-head">
                <div className="neo-sec-title">Upload Practice Set</div>
              </div>

              {/* Step 1: Pick chapter */}
              <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, color: '#555' }}>
                  STEP 1 — SELECT TARGET CHAPTER (optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'Space Mono,monospace', color: '#777' }}>Book</div>
                    <select value={selectedBookId} onChange={e => { setSelectedBookId(e.target.value); setSelectedChapterId(''); }}
                      style={{ width: '100%', padding: '11px 14px', border: '3px solid #0a0a0a', background: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '3px 3px 0 #0a0a0a' }}>
                      <option value="">— Auto-detect from JSON —</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'Space Mono,monospace', color: '#777' }}>Chapter</div>
                    <select value={selectedChapterId} onChange={e => setSelectedChapterId(e.target.value)} disabled={!selectedBookId}
                      style={{ width: '100%', padding: '11px 14px', border: '3px solid #0a0a0a', background: selectedBookId ? '#fff' : '#f5f5f5', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 600, outline: 'none', cursor: selectedBookId ? 'pointer' : 'not-allowed', boxShadow: '3px 3px 0 #0a0a0a', opacity: selectedBookId ? 1 : 0.5 }}>
                      <option value="">— Select chapter —</option>
                      {[...selectedChapters].sort((a, b) => a.chapter_number - b.chapter_number).map(ch => (
                        <option key={ch.id} value={ch.id}>Ch {ch.chapter_number} — {ch.title} (Class {ch.class_identifier})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Existing quizzes for selected chapter */}
                {existingQuizzes.length > 0 && (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: '#fff3ee', border: '2px solid #ff7a00' }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#ff7a00', marginBottom: 8 }}>⚠ THIS CHAPTER ALREADY HAS {existingQuizzes.length} QUIZ{existingQuizzes.length > 1 ? 'ZES' : ''}</div>
                    {existingQuizzes.map(q => (
                      <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 6, height: 6, background: '#ff7a00', borderRadius: '50%', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{q.title}</span>
                        {q.difficulty && <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#999' }}>{q.difficulty}</span>}
                      </div>
                    ))}
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#777', marginTop: 8 }}>
                      Uploading with the same quiz_title will UPDATE it. A different title will ADD a new quiz.
                    </div>
                  </div>
                )}

                {selectedChapterId && existingQuizzes.length === 0 && (
                  <div style={{ marginTop: 12, fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#0fd68a', fontWeight: 700 }}>
                    ✓ No quizzes yet — uploading will create the first one for this chapter
                  </div>
                )}

                {!selectedBookId && (
                  <div style={{ marginTop: 12, fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#777' }}>
                    Leave blank to auto-detect from book_slug + chapter_number in JSON
                  </div>
                )}
              </div>

              {/* Step 2: JSON */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    STEP 2 — PASTE QUIZ JSON
                    {quizJson && (
                      <span style={{ padding: '2px 8px', background: isValid() ? '#b8f72b' : '#ff4d4d', border: '2px solid #0a0a0a', fontSize: 10, color: isValid() ? '#0a0a0a' : '#fff' }}>
                        {isValid() ? '✓ VALID' : '✗ INVALID'}
                      </span>
                    )}
                  </div>
                  <textarea value={quizJson} onChange={e => setQuizJson(e.target.value)} rows={16}
                    style={{ width: '100%', height: 260, padding: 12, border: `3px solid ${quizJson && !isValid() ? '#ff4d4d' : '#0a0a0a'}`, background: '#fff', fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#0a0a0a', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                    placeholder={'{\n  "quiz_title": "HCV Ch3 — MCQ Set 1",\n  "book_slug": "hcv",\n  "chapter_number": 3,\n  "difficulty": "medium",\n  "questions": [...]\n}'}
                  />
                  {uploadResult && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: uploadResult.type === 'success' ? '#b8f72b' : '#ff4d4d', border: '3px solid #0a0a0a', color: uploadResult.type === 'success' ? '#0a0a0a' : '#fff', fontSize: 13, fontWeight: 700 }}>
                      {uploadResult.type === 'success' ? '✓ ' : '✗ '}{uploadResult.msg}
                    </div>
                  )}
                  <button onClick={uploadQuiz} disabled={uploading || !quizJson || !isValid()} className="neu-btn neu-btn-black"
                    style={{ marginTop: 12, width: '100%', justifyContent: 'center', padding: 13, fontSize: 14, opacity: uploading || !quizJson ? 0.5 : 1 }}>
                    {uploading ? 'UPLOADING…' : selectedChapterId ? `UPLOAD TO SELECTED CHAPTER →` : 'UPLOAD (AUTO-DETECT) →'}
                  </button>
                </div>

                {/* Format reference */}
                <div style={{ background: '#fafafa', border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', padding: 20 }}>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>JSON FORMAT REFERENCE</div>
                  <pre style={{ background: '#111', color: '#f5d90a', padding: 16, fontSize: 10.5, lineHeight: 1.75, overflowY: 'auto', fontFamily: 'Space Mono,monospace', border: '3px solid #0a0a0a', maxHeight: 360, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{`{
  "quiz_title": "HCV Ch3 — MCQ Set 1",

  // Only needed if NOT selecting chapter above:
  "book_slug": "hcv",
  "book_title": "HC Verma",
  "class_identifier": "11",  // "11"|"12"|"common"
  "chapter_number": 3,
  "chapter_title": "Rest and Motion",

  "difficulty": "medium",  // easy|medium|hard

  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "A body at rest is...$v = u + at$",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "$$F = ma$$" },
        { "id": "d", "text": "Option D" }
      ],
      "correctOptionId": "b",
      "explanation": "Because $F = ma$..."
    },
    {
      "id": "q2",
      "type": "msq",
      "questionText": "Select all correct:",
      "options": [...],
      "correctOptionIds": ["a", "c"]
    },
    {
      "id": "q3",
      "type": "numerical",
      "questionText": "Find g (m/s²):",
      "correctAnswer": 9.8,
      "tolerance": 0.1,
      "explanation": "g ≈ 9.8 m/s²"
    }
  ]
}`}
                  </pre>
                  <div style={{ marginTop: 12, padding: '10px 12px', background: '#fffbe6', border: '2px solid #f5d90a' }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6 }}>MATH SUPPORT (KaTeX)</div>
                    <div style={{ fontSize: 11, lineHeight: 1.7, color: '#555' }}>
                      Inline: <code style={{ background: '#eee', padding: '1px 5px' }}>$F = ma$</code><br />
                      Display: <code style={{ background: '#eee', padding: '1px 5px' }}>$$\int f dx$$</code><br />
                      Works in questionText, options, and explanation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
