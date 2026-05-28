'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Clock } from '@phosphor-icons/react';
import { Post } from '@/lib/api';

interface FeaturedCardProps {
  post: Post;
}

export default function FeaturedCard({ post }: FeaturedCardProps) {
  const reduce = useReducedMotion();

  const formattedDate = new Date(post.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-warm-border bg-warm-card shadow-[0_2px_12px_0_rgba(26,28,25,0.06)] hover:shadow-[0_4px_24px_0_rgba(26,28,25,0.10)] transition-shadow duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">

        {/* Left: image */}
        <div className="lg:col-span-5 relative overflow-hidden min-h-[220px]">
          {post.image_url ? (
            <motion.div
              className="absolute inset-0"
              whileHover={reduce ? undefined : { scale: 1.04 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
                priority
              />
              {/* Right-side fade for seamless blend into card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-warm-card/40 hidden lg:block" />
            </motion.div>
          ) : (
            /* Fallback: sage-tinted pattern */
            <div className="absolute inset-0 bg-sage-subtle">
              <div aria-hidden="true" className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #2C6B5C 1px, transparent 1px),
                    linear-gradient(to bottom, #2C6B5C 1px, transparent 1px)
                  `,
                  backgroundSize: '48px 48px',
                }}
              />
            </div>
          )}
        </div>

        {/* Right: editorial content */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-warm-border">

          {/* Top: meta + title + summary */}
          <div className="space-y-4">
            {/* Badges row */}
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sage text-white">
                {post.category}
              </span>
              <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1.5">
                <Clock weight="regular" className="w-3.5 h-3.5" />
                {post.read_time} min de lectura
              </span>
            </div>

            {/* Title */}
            <Link href={`/posts/${post.slug}`} className="block group/title">
              <h2 className="font-serif text-2xl md:text-[1.75rem] lg:text-3xl font-bold text-ink group-hover/title:text-sage transition-colors duration-250 leading-tight">
                {post.title}
              </h2>
            </Link>

            {/* Summary */}
            <p className="text-ink-secondary text-[0.9375rem] leading-relaxed line-clamp-3">
              {post.summary}
            </p>
          </div>

          {/* Bottom: date + CTA */}
          <div className="mt-8 pt-5 border-t border-warm-border flex items-center justify-between">
            <span className="text-[12px] text-ink-muted">
              {formattedDate}
            </span>
            <Link
              href={`/posts/${post.slug}`}
              aria-label={`Leer: ${post.title}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sage text-white text-[13px] font-semibold hover:bg-sage-light active:scale-[0.98] transition-all duration-200"
            >
              Leer análisis
              <ArrowRight weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </article>
  );
}
