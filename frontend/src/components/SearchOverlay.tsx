'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
}

export default function SearchOverlay({ isOpen, onClose, posts }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden'; // Lock background scroll
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Filter posts client-side in real-time
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-obsidian/95 backdrop-blur-md px-4 pt-20 md:pt-32 pb-6 overflow-y-auto">
      {/* Backdrop click close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Panel */}
      <div className="w-full max-w-2xl bg-obsidian-card/90 border border-sand/20 rounded-2xl p-6 md:p-8 shadow-2xl relative animate-fade-in space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-500 hover:text-slate-900 rounded-full border border-border-subtle bg-obsidian-card hover:bg-obsidian-card-hover transition-colors focus:outline-none"
          aria-label="Cerrar búsqueda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <span className="text-[10px] uppercase tracking-widest text-sand font-bold">
            Buscador Dinámico
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Buscar en Geopolitiqué
          </h2>
        </div>

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Escriba palabras clave (por ejemplo: Ártico, Silicio, Litio)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full elegant-input pl-12 pr-4 py-4 text-base focus:outline-none"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sand">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4 pt-2">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-slate-500 text-sm space-y-2">
              <p>Comience a escribir para buscar informes especiales.</p>
              <div className="flex justify-center gap-2 pt-2 text-xs">
                <button onClick={() => setQuery('Ártico')} className="px-2.5 py-1 rounded bg-obsidian-card border border-border-subtle text-slate-600 hover:border-sand/30 hover:text-sand transition-all font-semibold">#Ártico</button>
                <button onClick={() => setQuery('Taiwán')} className="px-2.5 py-1 rounded bg-obsidian-card border border-border-subtle text-slate-600 hover:border-sand/30 hover:text-sand transition-all font-semibold">#Taiwán</button>
                <button onClick={() => setQuery('Litio')} className="px-2.5 py-1 rounded bg-obsidian-card border border-border-subtle text-slate-600 hover:border-sand/30 hover:text-sand transition-all font-semibold">#Litio</button>
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              <p className="text-xs text-sand font-bold uppercase tracking-wider">
                Resultados de búsqueda ({filteredPosts.length})
              </p>
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onClick={onClose}
                  className="block p-4 rounded-xl border border-border-subtle bg-obsidian-card/40 hover:bg-obsidian-card-hover/80 hover:border-sand/20 transition-all duration-200 group shadow-sm"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1.5 font-bold">
                    <span className="text-sand">{post.category}</span>
                    <span className="text-slate-500">{post.read_time} min</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-bold text-slate-900 group-hover:text-sand transition-colors leading-tight">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-sans font-medium">
                    {post.summary}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              <p>No se encontraron análisis que coincidan con &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-slate-400 mt-1">Pruebe con otros términos de búsqueda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
