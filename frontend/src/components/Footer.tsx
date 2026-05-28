'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { subscribeNewsletter } from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Por favor, introduce un correo electrónico válido.');
      return;
    }
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Error al suscribirse. Inténtalo de nuevo.');
    }
  };

  return (
    <footer className="w-full border-t border-warm-border bg-warm-surface">

      {/* Newsletter block */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 md:p-10 rounded-2xl border border-warm-border bg-warm-card shadow-[0_2px_12px_0_rgba(26,28,25,0.05)]">

          {/* Copy */}
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-sage font-semibold">
              Boletín Semanal
            </span>
            <h3 className="font-serif text-2xl md:text-[1.625rem] font-bold text-ink">
              La Circular de Geopolitiqué
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed max-w-xs">
              Informes exclusivos y análisis estratégicos directamente en su bandeja de entrada. Sin publicidad.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2.5">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                className="flex-grow warm-input px-4 py-2.5"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-sage text-white hover:bg-sage-light active:scale-[0.98] transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                {status === 'loading' ? 'Enviando...' : 'Suscribirse'}
              </button>
            </form>

            {status === 'success' && (
              <p role="status" className="text-[12px] text-sage font-semibold animate-fade-in">
                Suscrito con éxito. Gracias por leer Geopolitiqué.
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="text-[12px] text-rose-600 font-semibold animate-fade-in">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-warm-border flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-ink-muted">
          <p>© {new Date().getFullYear()} Geopolitiqué. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
            <a
              href="https://www.linkedin.com/in/sara-herrero-aina-2462ab18a/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors flex items-center gap-1.5"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
