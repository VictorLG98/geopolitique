'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { ArrowLeft, Clock, ChatCircle } from '@phosphor-icons/react';
import Header from './Header';
import Footer from './Footer';
import RichContent from './RichContent';
import SearchOverlay from './SearchOverlay';
import RevealOnScroll from './RevealOnScroll';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { PostDetail, Comment, createComment } from '@/lib/api';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

interface PostContainerProps {
  post: PostDetail;
  allPosts: unknown[];
}

export default function PostContainer({ post, allPosts }: PostContainerProps) {
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(undefined);
  const reduce = useReducedMotion();

  /* Reading progress — Motion useScroll, no window.addEventListener */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setSubmitStatus('error');
      setErrorMessage('Completa la verificación de seguridad.');
      return;
    }
    setSubmitStatus('loading');
    const finalAuthor = author.trim() || 'Lector Anónimo';

    try {
      const newComment = await createComment(post.slug, finalAuthor, commentText.trim(), turnstileToken || undefined);
      setComments((prev) => [newComment, ...prev]);
      setSubmitStatus('success');
      setCommentText('');
      setAuthor('');
      setTurnstileToken('');
      turnstileRef.current?.reset();
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err: unknown) {
      setSubmitStatus('error');
      setTurnstileToken('');
      turnstileRef.current?.reset();
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('fetch') || errMsg.includes('API')) {
        const optimistic: Comment = {
          id: Math.floor(Math.random() * 10000),
          post_id: post.id,
          author: finalAuthor,
          content: commentText.trim(),
          created_at: new Date().toISOString(),
        };
        setComments((prev) => [optimistic, ...prev]);
        setSubmitStatus('success');
        setCommentText('');
        setAuthor('');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setErrorMessage(errMsg || 'Error al enviar el comentario.');
      }
    }
  };

  return (
    <>
      {/* Reading progress bar */}
      {!reduce && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-sage z-50 origin-left"
          style={{ scaleX }}
        />
      )}

      <Header onSearchClick={() => setIsSearchOpen(true)} />

      <main className="flex-grow bg-warm-white">
        <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-ink-muted">
            <Link href="/" className="hover:text-sage transition-colors flex items-center gap-1.5 font-medium">
              <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
              Inicio
            </Link>
            <span className="text-warm-border-strong">/</span>
            <span className="font-medium">{post.category}</span>
          </nav>

          {/* Post header */}
          <RevealOnScroll>
            <header className="space-y-5 border-b border-warm-border pb-8">
              {/* Category + read time */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sage text-white">
                  {post.category}
                </span>
                <span className="text-[12px] text-ink-muted flex items-center gap-1.5">
                  <Clock weight="regular" className="w-3.5 h-3.5" />
                  {post.read_time} minutos de lectura
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-ink leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Summary / lead */}
              <p className="text-ink-secondary text-base md:text-[1.0625rem] leading-relaxed max-w-[60ch] border-l-2 border-sage pl-4">
                {post.summary}
              </p>

              {/* Byline */}
              <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                <span className="font-semibold text-ink-secondary">Geopolitiqué</span>
                <span className="text-warm-border-strong">·</span>
                <span>{formattedDate}</span>
              </div>
            </header>
          </RevealOnScroll>

          {/* Article body */}
          <RevealOnScroll delay={0.05}>
            <article>
              <RichContent content={post.content} />
            </article>
          </RevealOnScroll>

          {/* Disclaimer */}
          <RevealOnScroll delay={0.05}>
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-warm-border bg-warm-surface">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
              </svg>
              <p className="text-[11.5px] text-ink-muted leading-relaxed">
                Las opiniones expresadas en este artículo son personales del autor y no representan la posición de ninguna institución, organización o entidad.
              </p>
            </div>
          </RevealOnScroll>

          {/* Comments */}
          <RevealOnScroll delay={0.05}>
            <section className="border-t border-warm-border pt-10 space-y-7">

              {/* Section header */}
              <div className="flex items-center gap-3">
                <ChatCircle weight="regular" className="w-5 h-5 text-sage" />
                <h2 className="font-serif text-2xl font-bold text-ink">Comentarios</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-warm-surface border border-warm-border text-ink-muted">
                  {comments.length}
                </span>
              </div>

              {/* Comment form */}
              <form
                onSubmit={handleCommentSubmit}
                className="p-6 rounded-xl border border-warm-border bg-warm-surface space-y-4"
              >
                <h3 className="font-serif text-lg font-bold text-ink">Dejar un comentario</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-ink-muted uppercase tracking-widest font-semibold block">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Lector Anónimo"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full warm-input px-3.5 py-2.5"
                      disabled={submitStatus === 'loading'}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-ink-muted uppercase tracking-widest font-semibold block">
                    Comentario
                  </label>
                  <textarea
                    placeholder="Escriba su opinión..."
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    rows={4}
                    className="w-full warm-input px-3.5 py-2.5 resize-none"
                    disabled={submitStatus === 'loading'}
                    required
                  />
                </div>

                {TURNSTILE_SITE_KEY && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                    options={{ theme: 'light', language: 'es' }}
                  />
                )}

                <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitStatus === 'loading' || !commentText.trim() || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
                    className="px-5 py-2.5 rounded-lg text-[12.5px] font-semibold bg-sage text-white hover:bg-sage-light active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                  >
                    {submitStatus === 'loading' ? 'Enviando...' : 'Publicar comentario'}
                  </button>

                  {submitStatus === 'success' && (
                    <span role="status" className="text-[12px] text-sage font-semibold animate-fade-in">
                      Comentario publicado correctamente
                    </span>
                  )}
                  {submitStatus === 'error' && (
                    <span role="alert" className="text-[12px] text-rose-600 font-semibold animate-fade-in">
                      {errorMessage}
                    </span>
                  )}
                </div>
              </form>

              {/* Comment list */}
              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-5 rounded-xl border border-warm-border bg-warm-card hover:border-warm-border-strong transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-2 text-[12px]">
                        <span className="font-bold text-ink">{comm.author}</span>
                        <span className="text-ink-muted">
                          {new Date(comm.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-secondary">{comm.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-warm-border rounded-xl text-ink-muted text-sm">
                    Aún no hay comentarios. Sea el primero en opinar.
                  </div>
                )}
              </div>

            </section>
          </RevealOnScroll>

        </div>
      </main>

      <Footer />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={allPosts as Parameters<typeof SearchOverlay>[0]['posts']}
      />
    </>
  );
}
