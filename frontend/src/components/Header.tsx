'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-40 w-full transition-all duration-400',
        scrolled
          ? 'bg-warm-white/94 backdrop-blur-md border-b border-warm-border shadow-[0_1px_0_0_#E5E2DB]'
          : 'bg-warm-white border-b border-warm-border',
      ].join(' ')}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="group flex flex-col items-start select-none shrink-0">
            <span className="font-serif text-xl font-bold tracking-tight text-ink transition-colors duration-200 group-hover:text-sage leading-none">
              Geopolitiqué<span className="text-sage">.</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-ink-muted font-medium mt-0.5">
              Análisis Estratégico
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-[13px] font-medium">
            {[
              { href: '/',                    label: 'Inicio' },
              { href: '/?category=Seguridad', label: 'Seguridad' },
              { href: '/?category=Tecnologia',label: 'Tecnología' },
              { href: '/?category=Economia',  label: 'Economía' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-ink-secondary hover:text-ink hover:bg-warm-surface transition-all duration-150"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex items-center shrink-0">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-warm-border text-ink-muted hover:text-sage hover:border-sage/40 hover:bg-sage-subtle transition-all duration-200 text-[13px] font-medium"
                aria-label="Buscar artículo"
              >
                <MagnifyingGlass weight="regular" className="h-4 w-4" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
