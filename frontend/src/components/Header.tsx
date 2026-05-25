'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand/10 bg-obsidian/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Brand */}
          <Link 
            href="/" 
            className="group flex flex-col items-start select-none"
          >
            <span className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-sand">
              Geopolitiqué<span className="text-sand">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-sand font-semibold opacity-90 mt-0.5 group-hover:opacity-100 transition-opacity">
              Análisis Estratégico Global
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide">
            <Link href="/" className="text-sand hover:text-slate-900 transition-colors duration-200">
              Inicio
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/?category=Seguridad" className="text-slate-500 hover:text-sand transition-colors duration-200">
              Seguridad
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/?category=Tecnologia" className="text-slate-500 hover:text-sand transition-colors duration-200">
              Tecnología
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/?category=Economia" className="text-slate-500 hover:text-sand transition-colors duration-200">
              Economía
            </Link>
          </nav>

          {/* Search Button Icon */}
          <div className="flex items-center gap-4">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="flex items-center justify-center p-2 rounded-full border border-border-subtle text-slate-500 hover:text-sand hover:border-sand/30 bg-obsidian-card-hover/40 hover:bg-obsidian-card-hover/80 transition-all duration-300 group focus:outline-none"
                aria-label="Buscar artículo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
