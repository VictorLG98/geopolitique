'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from './Header';
import FeaturedCard from './FeaturedCard';
import PostCard from './PostCard';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import { Post } from '@/lib/api';

interface HomeContainerProps {
  initialPosts: Post[];
}

export default function HomeContainer({ initialPosts }: HomeContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync category state with URL parameters (for shareable links and navigation)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      // Normalize casing
      const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      setSelectedCategory(normalized);
    } else {
      setSelectedCategory('Todos');
    }
  }, [searchParams]);

  // Categories list
  const categories = ['Todos', 'Seguridad', 'Tecnología', 'Economía'];

  // Handle category button click
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'Todos') {
      router.push('/');
    } else {
      router.push(`/?category=${category.toLowerCase()}`);
    }
  };

  // Filter posts based on selected category
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'Todos') return true;
    return post.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <>
      {/* Header */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Main Content Layout */}
      <main className="flex-grow mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
        
        {/* Intro Hero Section */}
        <section className="space-y-4 text-center max-w-2xl mx-auto py-4 animate-fade-in">
          <span className="text-[10px] uppercase tracking-widest text-sand font-extrabold bg-sand/5 border border-sand/10 px-3 py-1 rounded-full">
            Inteligencia y Geopolítica
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
            Comprender las fuerzas del mañana
          </h1>
          <p className="text-sm md:text-base text-slate-650 font-sans max-w-lg mx-auto font-medium">
            Informes semanales rigurosos sobre las dinámicas de poder global, rutas estratégicas de comercio, cuellos de botella y cadenas críticas de suministro.
          </p>
        </section>

        {/* Category Filters Bar */}
        <section className="flex flex-wrap items-center justify-center gap-2 border-y border-border-subtle py-6 animate-fade-in">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 text-xs md:text-sm font-bold tracking-wide rounded-lg border font-sans transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-sand border-sand text-white shadow-lg shadow-sand/10'
                  : 'bg-obsidian-card/45 border-border-subtle text-slate-500 hover:border-sand/30 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Dynamic Posts Display */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-16">
            {/* Featured Section */}
            {featuredPost && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sand" />
                  <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-sans">
                    Análisis Principal
                  </h2>
                </div>
                <FeaturedCard post={featuredPost} />
              </section>
            )}

            {/* Grid Section */}
            {gridPosts.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sand" />
                  <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-sans">
                    Informes Recientes
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {gridPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-500 animate-fade-in space-y-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-base font-semibold">No hay artículos publicados en esta categoría todavía.</p>
            <p className="text-xs text-slate-400 font-medium">Por favor, consulte de nuevo más tarde o seleccione otra sección.</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        posts={posts} 
      />
    </>
  );
}
