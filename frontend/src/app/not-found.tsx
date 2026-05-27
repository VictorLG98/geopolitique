import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-6">
      <span className="text-[10px] uppercase tracking-widest text-sand font-extrabold bg-sand/5 border border-sand/10 px-3 py-1 rounded-full">
        Error 404
      </span>
      <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Página no encontrada
      </h1>
      <p className="text-sm md:text-base text-slate-500 font-sans max-w-md">
        El artículo o página que buscas no existe o ha sido movido. Vuelve a la portada para descubrir nuestros análisis.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-white text-sm font-bold rounded-lg hover:bg-sand-dark transition-colors duration-300 font-sans"
      >
        Volver a la portada
      </Link>
    </main>
  );
}
