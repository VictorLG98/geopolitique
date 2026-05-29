import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-6">
      <span className="text-[10px] uppercase tracking-widest text-sage font-extrabold bg-sage-subtle border border-sage/20 px-3 py-1 rounded-full">
        Error 404
      </span>
      <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight">
        Página no encontrada
      </h1>
      <p className="text-sm md:text-base text-ink-secondary font-sans max-w-md">
        El artículo o página que buscas no existe o ha sido movido. Vuelve a la portada para descubrir nuestros análisis.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-sage text-white text-sm font-bold rounded-lg hover:bg-sage-light transition-colors duration-300 font-sans"
      >
        Volver a la portada
      </Link>
    </main>
  );
}
