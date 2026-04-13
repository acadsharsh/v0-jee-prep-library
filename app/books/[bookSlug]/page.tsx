'use client';
import{useEffect,useState}from'react';
import{useParams}from'next/navigation';
import{Navigation}from'@/components/navigation';
import{ChapterBrowser}from'@/components/chapter-browser';
import{useAuth}from'@/lib/auth-context';
import Link from'next/link';

interface ChaptersData{[classId:string]:Array<{id:string;book_id:string;class_identifier:string;chapter_number:number;title:string;slug:string;created_at:string;}>;}

export default function BookPage(){
  const params=useParams();const bookSlug=params.bookSlug as string;
  const[chapters,setChapters]=useState<ChaptersData>({});
  const[isLoading,setIsLoading]=useState(true);
  const[bookTitle,setBookTitle]=useState('');
  const{user}=useAuth();
  const ini=user?.email?.slice(0,2).toUpperCase()??'JE';
  const name=user?.email?.split('@')[0]??'User';
  const total=Object.values(chapters).reduce((s,a)=>s+a.length,0);

  useEffect(()=>{
    (async()=>{
      try{const[cr,br]=await Promise.all([fetch(`/api/books/${bookSlug}/chapters`),fetch('/api/books')]);const data=await cr.json();const books=await br.json();setChapters(data);const book=books.find((b:any)=>b.slug===bookSlug);if(book)setBookTitle(book.title);}
      catch(e){console.error(e);}finally{setIsLoading(false);}
    })();
  },[bookSlug]);

  return(
    <div className="neo-shell">
      <Navigation/>
      <div className="neo-main">
        <div className="neo-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Link href="/dashboard" style={{fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,color:'#777',textTransform:'uppercase',letterSpacing:'0.05em'}}>← Dashboard</Link>
            <span style={{color:'#ccc'}}>/</span>
            <span className="neo-topbar-title">{bookTitle||bookSlug}</span>
            {!isLoading&&total>0&&<div style={{background:'#f5d90a',border:'2px solid #0a0a0a',padding:'2px 10px',fontFamily:'Space Mono,monospace',fontSize:11,fontWeight:700}}>{total} CH</div>}
          </div>
          <div className="neo-topbar-right">
            <div style={{padding:'6px 14px',background:'#0a0a0a',color:'#f5d90a',fontFamily:'Space Mono,monospace',fontSize:12,fontWeight:700,border:'2px solid #0a0a0a'}}>{ini}</div>
          </div>
        </div>
        <div style={{padding:'24px'}}>
          <ChapterBrowser chapters={chapters} bookSlug={bookSlug} isLoading={isLoading}/>
        </div>
      </div>
    </div>
  );
}
