import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr';
import { Post } from '@/lib/api';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-warm-border bg-warm-card hover:border-warm-border-strong hover:shadow-[0_3px_16px_0_rgba(26,28,25,0.08)] transition-all duration-250">

      {/* Image thumbnail */}
      {post.image_url && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 560px"
          />
          {/* Category badge over image */}
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-white/90 text-sage border border-sage/20 backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 space-y-3">

        {/* Category badge (no-image fallback) */}
        {!post.image_url && (
          <span className="self-start px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-sage-subtle text-sage border border-sage/20">
            {post.category}
          </span>
        )}

        {/* Title */}
        <Link href={`/posts/${post.slug}`} className="block">
          <h3 className="font-serif text-[1.125rem] md:text-xl font-bold leading-snug text-ink group-hover:text-sage transition-colors duration-200">
            {post.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-ink-secondary line-clamp-2 flex-1">
          {post.summary}
        </p>

        {/* Footer row */}
        <div className="pt-3 border-t border-warm-border flex items-center justify-between text-[12px]">
          <span className="text-ink-muted flex items-center gap-1.5">
            <Clock weight="regular" className="w-3.5 h-3.5 shrink-0" />
            {post.read_time} min
            <span className="mx-1 text-warm-border-strong">·</span>
            {formattedDate}
          </span>
          <Link
            href={`/posts/${post.slug}`}
            aria-label={`Leer: ${post.title}`}
            className="flex items-center gap-1 font-semibold text-sage opacity-75 group-hover:opacity-100 transition-opacity duration-200"
          >
            Leer
            <ArrowRight weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

      </div>
    </article>
  );
}
