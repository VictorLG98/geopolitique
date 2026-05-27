'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-6">
      <span className="text-[10px] uppercase tracking-widest text-sand font-extrabold bg-sand/5 border border-sand/10 px-3 py-1 rounded-full">
        Error inesperado
      </span>
      <h1 className="font-serif text-4xl font-extrabold text-slate-900 tracking-tight">
        Algo ha salido mal
      </h1>
      <p className="text-sm text-slate-500 font-sans max-w-md">
        Se ha producido un error al cargar esta página. Por favor, inténtalo de nuevo.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-sand text-white text-sm font-bold rounded-lg hover:bg-sand-dark transition-colors duration-300 font-sans"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-border-subtle text-slate-600 text-sm font-bold rounded-lg hover:border-sand/30 hover:text-slate-900 transition-colors duration-300 font-sans"
        >
          Ir a la portada
        </Link>
      </div>
    </main>
  );
}
