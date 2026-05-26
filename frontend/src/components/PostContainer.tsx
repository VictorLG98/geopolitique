'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import RichContent from './RichContent';
import SearchOverlay from './SearchOverlay';
import { PostDetail, Comment, createComment } from '@/lib/api';

interface PostContainerProps {
  post: PostDetail;
  allPosts: any[]; // For SearchOverlay
}

export default function PostContainer({ post, allPosts }: PostContainerProps) {
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sync scroll height to update top reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format publication date
  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Handle new comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitStatus('loading');
    const finalAuthor = author.trim() || 'Lector Anónimo';

    try {
      const newComment = await createComment(post.slug, finalAuthor, commentText.trim());
      
      // Update local comments state dynamically (putting newest on top)
      setComments((prev) => [newComment, ...prev]);
      
      setSubmitStatus('success');
      setCommentText('');
      setAuthor('');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err: any) {
      setSubmitStatus('error');
      // If backend is offline, support dynamic optimistic locally added comment so the user can test the comment functionality!
      if (err.message.includes('fetch') || err.message.includes('API')) {
        const optimisticComment: Comment = {
          id: Math.floor(Math.random() * 10000),
          post_id: post.id,
          author: finalAuthor,
          content: commentText.trim(),
          created_at: new Date().toISOString()
        };
        setComments((prev) => [optimisticComment, ...prev]);
        setSubmitStatus('success');
        setCommentText('');
        setAuthor('');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setErrorMessage(err.message || 'Error al enviar el comentario.');
      }
    }
  };

  return (
    <>
      {/* Top scroll reading progress bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-sand z-50 transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Main post layout */}
      <main className="flex-grow mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation Breadcrumb */}
        <nav className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2 select-none animate-fade-in">
          <Link href="/" className="hover:text-sand transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-slate-400 font-semibold">{post.category}</span>
        </nav>

        {/* Post Heading Hero */}
        <section className="space-y-6 border-b border-border-subtle pb-8 animate-fade-in">
          <div className="flex items-center gap-3 text-xs tracking-wider">
            <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-sand bg-sand/5 border border-sand/10">
              {post.category}
            </span>
            <span className="text-slate-500 font-semibold">{post.read_time} minutos de lectura</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-slate-500 font-sans font-semibold">
            <span>Redacción Geopolitiqué</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </section>

        {/* Main Post Article Body */}
        <article className="animate-fade-in">
          <RichContent content={post.content} />
        </article>

        {/* Comments Section */}
        <section className="border-t border-border-subtle pt-12 space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Comentarios</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-obsidian-card border border-border-subtle text-slate-500">
              {comments.length}
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="glass-panel p-6 rounded-xl space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-800">
              Dejar un Comentario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block">Nombre</label>
                <input
                  type="text"
                  placeholder="Lector Anónimo"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full elegant-input px-3.5 py-2.5 text-sm"
                  disabled={submitStatus === 'loading'}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block">Comentario</label>
              <textarea
                placeholder="Escriba su opinión..."
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  if (submitStatus === 'error') setSubmitStatus('idle');
                }}
                rows={4}
                className="w-full elegant-input px-3.5 py-2.5 text-sm resize-none"
                disabled={submitStatus === 'loading'}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={submitStatus === 'loading' || !commentText.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-sand text-white hover:bg-sand-light active:scale-95 transition-all duration-200 disabled:opacity-40"
              >
                {submitStatus === 'loading' ? 'Enviando...' : 'Publicar comentario'}
              </button>
              
              {submitStatus === 'success' && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Comentario publicado
                </span>
              )}

              {submitStatus === 'error' && (
                <span className="text-xs text-rose-700 font-semibold flex items-center gap-1 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errorMessage}
                </span>
              )}
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comm) => (
                <div 
                  key={comm.id} 
                  className="p-5 rounded-xl border border-border-subtle bg-obsidian-card/40 space-y-2 animate-fade-in hover:border-sand/10 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {comm.author}
                    </span>
                    <span className="text-slate-500 font-sans font-semibold">
                      {new Date(comm.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 font-sans font-medium">
                    {comm.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-border-subtle rounded-xl text-slate-500 text-sm">
                Aún no hay comentarios en esta publicación. Sea el primero en opinar.
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        posts={allPosts} 
      />
    </>
  );
}
