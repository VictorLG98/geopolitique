import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';

interface FeaturedCardProps {
  post: Post;
}

export default function FeaturedCard({ post }: FeaturedCardProps) {
  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="glass-panel rounded-2xl overflow-hidden border border-sand/10 bg-obsidian-card/45 hover:border-sand/30 transition-all duration-500 animate-fade-in shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Solid Abstract Editorial Accent (Warm Light Gradient) */}
        <div className="lg:col-span-4 relative bg-gradient-to-br from-[#eae5db] to-[#f4f1eb] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sand/5 select-none min-h-[220px]">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-sand font-extrabold bg-sand/5 border border-sand/10 px-2.5 py-1 rounded-full">
              DESTACADO
            </span>
          </div>
          
          {/* Abstract SVG illustration representing global maps / routes */}
          <div aria-hidden="true" className="absolute right-4 bottom-4 w-40 h-40 opacity-[0.12] text-sand pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
              <circle cx="50" cy="50" r="40" />
              <path d="M10 50h80M50 10v80" />
              <path d="M20 30c30 0 30 40 60 40" strokeDasharray="2,2" />
              <path d="M15 70c20-20 50-20 70 0" />
            </svg>
          </div>
          
          <div className="space-y-1">
            <span className="font-serif text-3xl font-extrabold text-slate-900/5 tracking-tighter block leading-none select-none">
              GEOPOLITIQUE
            </span>
            <span className="text-[10px] text-slate-600 uppercase tracking-widest block font-bold">
              Informe Especial
            </span>
          </div>
        </div>

        {/* Right Side: Editorial Content */}
        <div className="lg:col-span-8 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs tracking-wider">
              <span className="font-sans font-bold uppercase text-sand">
                {post.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-semibold">
                {post.read_time} min de lectura
              </span>
            </div>

            <Link href={`/posts/${post.slug}`} className="block group">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 group-hover:text-sand transition-colors duration-300 leading-tight">
                {post.title}
              </h2>
            </Link>

            <p className="text-sm md:text-base leading-relaxed text-slate-600 font-sans">
              {post.summary}
            </p>
          </div>

          <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-slate-600 font-sans">
              Publicado el {formattedDate}
            </span>
            <Link
              href={`/posts/${post.slug}`}
              aria-label={`Leer: ${post.title}`}
              className="flex items-center gap-2 text-sm font-bold tracking-wide text-sand hover:text-slate-900 transition-colors duration-300 font-sans group/link"
            >
              Comenzar lectura
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transform group-hover/link:translate-x-1.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </article>
  );
}
