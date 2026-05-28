'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MagnifyingGlass, X, Clock } from '@phosphor-icons/react';
import { Post } from '@/lib/api';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
}

export default function SearchOverlay({ isOpen, onClose, posts }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredPosts = posts.filter((post) => {
    const term = query.toLowerCase().trim();
    if (!term) return false;
    return (
      post.title.toLowerCase().includes(term) ||
      post.summary.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en Geopolitiqué"
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 backdrop-blur-sm px-4 pt-16 md:pt-24 pb-6 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-xl bg-warm-card border border-warm-border rounded-2xl p-6 shadow-[0_20px_60px_rgba(26,28,25,0.15)] relative animate-fade-up space-y-5">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-warm-surface transition-colors"
          aria-label="Cerrar búsqueda"
        >
          <X weight="bold" className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <h2 className="font-serif text-xl font-bold text-ink">Buscar análisis</h2>
        </div>

        {/* Input */}
        <div className="relative">
          <MagnifyingGlass weight="regular" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sage" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ártico, Taiwán, Litio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full warm-input pl-10 pr-4 py-3"
          />
        </div>

        {/* Results */}
        <div aria-live="polite" className="space-y-3">
          {query.trim() === '' ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-ink-secondary text-sm">Comience a escribir para buscar informes.</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['Ártico', 'Taiwán', 'Litio'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full text-[12px] font-semibold border border-warm-border text-ink-secondary hover:border-sage/40 hover:text-sage hover:bg-sage-subtle transition-all duration-150"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              <p className="text-[11px] text-sage font-semibold uppercase tracking-wider">
                {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''}
              </p>
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onClick={onClose}
                  className="block p-4 rounded-xl border border-warm-border bg-warm-white hover:border-warm-border-strong hover:bg-warm-card transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-sage font-bold uppercase tracking-wider">{post.category}</span>
                    <span className="text-ink-muted flex items-center gap-1">
                      <Clock weight="regular" className="w-3 h-3" />
                      {post.read_time} min
                    </span>
                  </div>
                  <h4 className="font-serif text-[1rem] font-semibold text-ink group-hover:text-sage transition-colors leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-[12px] text-ink-muted mt-1 line-clamp-1">{post.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ink-muted text-sm">
              Sin resultados para &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
