import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Format publication date in Spanish
  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group flex flex-col justify-between p-6 rounded-xl border border-border-subtle bg-obsidian-card/40 hover:bg-obsidian-card-hover/40 hover:border-sand/30 transition-all duration-300 animate-fade-in shadow-sm">
      <div className="space-y-4">
        {/* Category & Read Time metadata */}
        <div className="flex items-center justify-between text-xs tracking-wider">
          <span className="px-2.5 py-0.5 rounded-full font-sans font-semibold uppercase text-sand bg-sand/5 border border-sand/10">
            {post.category}
          </span>
          <span className="text-slate-500 font-semibold">
            {post.read_time} min de lectura
          </span>
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`} className="block group/title">
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight text-slate-900 group-hover/title:text-sand transition-colors duration-300">
            {post.title}
          </h3>
        </Link>

        {/* Summary Description */}
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3 font-sans">
          {post.summary}
        </p>
      </div>

      {/* Footer link & date */}
      <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
        <span className="text-slate-500 font-semibold font-sans">
          {formattedDate}
        </span>
        <Link
          href={`/posts/${post.slug}`}
          className="flex items-center gap-1 font-bold text-sand group-hover:text-slate-900 transition-colors duration-300 font-sans"
        >
          Leer artículo
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
