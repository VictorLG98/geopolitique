'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import Header from './Header';
import FeaturedCard from './FeaturedCard';
import PostCard from './PostCard';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import RevealOnScroll from './RevealOnScroll';
import { Post } from '@/lib/api';

interface HomeContainerProps {
  initialPosts: Post[];
}

const CATEGORIES = ['Todos', 'Seguridad', 'Tecnología', 'Economía'];

export default function HomeContainer({ initialPosts }: HomeContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts] = useState<Post[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      setSelectedCategory(normalized);
    } else {
      setSelectedCategory('Todos');
    }
  }, [searchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    router.push(category === 'Todos' ? '/' : `/?category=${category.toLowerCase()}`);
  };

  const filteredPosts = posts.filter((post) =>
    selectedCategory === 'Todos'
      ? true
      : post.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <>
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      <main className="flex-grow w-full">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative border-b border-warm-border bg-warm-white">
          {/* Subtle grid texture */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #2C6B5C 1px, transparent 1px),
                  linear-gradient(to bottom, #2C6B5C 1px, transparent 1px)
                `,
                backgroundSize: '64px 64px',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Left: headline */}
              <div className="lg:col-span-7 space-y-5">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-sage font-semibold border border-sage/20 bg-sage-subtle px-3 py-1 rounded-full">
                    Inteligencia Geopolítica
                  </span>
                </motion.div>

                <motion.h1
                  className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-ink leading-[1.07] tracking-tight"
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  Comprender<br />
                  <em className="text-sage not-italic">las fuerzas</em><br />
                  del mañana.
                </motion.h1>

                <motion.p
                  className="text-ink-secondary text-base md:text-[1.0625rem] leading-relaxed max-w-[50ch]"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  Informes semanales sobre dinámicas de poder global, rutas estratégicas de comercio y cadenas críticas de suministro.
                </motion.p>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href="#articulos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sage text-white text-[13.5px] font-semibold hover:bg-sage-light active:scale-[0.98] transition-all duration-200"
                  >
                    Ver análisis
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
                  </a>
                </motion.div>
              </div>

              {/* Right: decorative cartographic SVG */}
              <motion.div
                aria-hidden="true"
                className="hidden lg:flex lg:col-span-5 items-center justify-center select-none"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.25 }}
              >
                <svg viewBox="0 0 280 240" fill="none" className="w-full max-w-[280px] h-auto opacity-30 text-sage">
                  <circle cx="140" cy="120" r="96"  stroke="currentColor" strokeWidth="0.75" strokeDasharray="5 7" />
                  <circle cx="140" cy="120" r="68"  stroke="currentColor" strokeWidth="0.75" />
                  <circle cx="140" cy="120" r="40"  stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 5" />
                  <line x1="44"  y1="120" x2="236" y2="120" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="140" y1="24"  x2="140" y2="216" stroke="currentColor" strokeWidth="0.6" />
                  <path d="M66 80 Q108 100 140 120 Q176 142 210 132" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 6" strokeLinecap="round" />
                  <path d="M52 160 Q96 140 140 120 Q184 102 226 76" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 6" strokeLinecap="round" />
                  <circle cx="140" cy="120" r="4.5" fill="currentColor" />
                  <circle cx="96"  cy="90"  r="3" fill="currentColor" opacity="0.65" />
                  <circle cx="188" cy="142" r="3" fill="currentColor" opacity="0.65" />
                  <circle cx="172" cy="84"  r="2" fill="currentColor" opacity="0.45" />
                  <circle cx="106" cy="155" r="2" fill="currentColor" opacity="0.45" />
                </svg>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Category filters ───────────────────────────────────────────────── */}
        <section className="border-b border-warm-border bg-warm-white sticky top-[60px] z-30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  aria-current={selectedCategory === cat ? 'true' : undefined}
                  className={[
                    'px-4 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-200',
                    selectedCategory === cat
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-ink-secondary hover:text-ink hover:bg-warm-surface',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Posts ──────────────────────────────────────────────────────────── */}
        <div id="articulos" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {filteredPosts.length > 0 ? (
            <>
              {featuredPost && (
                <RevealOnScroll>
                  <FeaturedCard post={featuredPost} />
                </RevealOnScroll>
              )}

              {gridPosts.length > 0 && (
                <section className="space-y-5">
                  {/* Divider label */}
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-warm-border" />
                    <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted font-semibold px-1">
                      Informes recientes
                    </span>
                    <span className="h-px flex-1 bg-warm-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {gridPosts.map((post, i) => (
                      <RevealOnScroll key={post.id} delay={i * 0.07}>
                        <PostCard post={post} />
                      </RevealOnScroll>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-20 space-y-3">
              <p className="font-serif text-xl text-ink">Sin artículos en esta categoría.</p>
              <p className="text-ink-muted text-sm">Consulte de nuevo más tarde o seleccione otra sección.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts}
      />
    </>
  );
}
