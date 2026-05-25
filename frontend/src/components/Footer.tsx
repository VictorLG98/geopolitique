'use client';

import React, { useState } from 'react';
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
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Error al suscribirse. Inténtalo de nuevo.');
    }
  };

  return (
    <footer className="w-full border-t border-sand/10 bg-obsidian">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="max-w-md space-y-3 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-sand font-bold">
              Boletín Semanal
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-slate-900">
              Suscripción a la Circular
            </h3>
            <p className="text-sm text-slate-600">
              Reciba informes exclusivos, mapas interactivos y análisis estratégicos directamente en su bandeja de entrada. Sin publicidad.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Introduzca su correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                className="flex-grow elegant-input px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sand"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 rounded-lg text-sm font-bold tracking-wide bg-sand text-white hover:bg-sand-light active:scale-95 transition-all duration-300 font-sans shadow-lg shadow-sand/10 disabled:opacity-50"
              >
                {status === 'loading' ? 'Enviando...' : 'Suscribirse'}
              </button>
            </form>

            {/* Validation Feedback Messages */}
            {status === 'success' && (
              <p className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ¡Suscrito con éxito! Gracias por leer Geopolitiqué.
              </p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-xs text-rose-700 font-semibold flex items-center gap-1.5 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Lower Footer */}
        <div className="mt-16 border-t border-border-subtle pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Geopolitiqué. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 font-medium">
            <span className="text-slate-350">|</span>
            <span className="text-slate-500 hover:text-sand cursor-default transition-colors">
              Rutas comerciales
            </span>
            <span className="text-slate-350">|</span>
            <span className="text-slate-500 hover:text-sand cursor-default transition-colors">
              Materias Primas
            </span>
            <span className="text-slate-350">|</span>
            <span className="text-slate-500 hover:text-sand cursor-default transition-colors">
              Seguridad Nacional
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
