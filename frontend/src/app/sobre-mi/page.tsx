import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description: 'Quién está detrás de Geopolitiqué y por qué este blog.',
};

export default function SobreMiPage() {
  return (
    <>
      <Header />

      <main className="flex-grow bg-warm-white">
        <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12">

          {/* Header */}
          <header className="space-y-4 border-b border-warm-border pb-10">
            <span className="text-[11px] uppercase tracking-widest text-sage font-bold">
              Sobre mí
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight tracking-tight">
              Quién hay detrás<br className="hidden sm:block" /> de Geopolitiqué
            </h1>
            <p className="text-ink-secondary text-base leading-relaxed max-w-[55ch]">
              Un espacio de análisis estratégico sobre las fuerzas que dan forma al mundo: seguridad, tecnología, economía y política internacional.
            </p>
          </header>

          {/* Bio */}
          <section className="space-y-5 text-ink-secondary text-[15px] leading-[1.75]">
            <p>
              {/* Edita este párrafo con tu presentación personal */}
              Soy [nombre], analista e investigador interesado en las dinámicas geopolíticas del siglo XXI. Este blog nació de la necesidad de explicar, con rigor pero sin tecnicismos innecesarios, los grandes movimientos que definen el orden internacional contemporáneo.
            </p>
            <p>
              {/* Edita este párrafo con tu trayectoria o enfoque */}
              Mi enfoque combina perspectivas históricas y estructurales con el análisis de la actualidad. Creo que entender el presente exige mirar hacia atrás con honestidad y hacia adelante con humildad.
            </p>
            <p>
              {/* Edita este párrafo con lo que publicas */}
              En Geopolitiqué encontrarás artículos sobre seguridad global, recursos estratégicos, tecnología y poder, y las nuevas fronteras del comercio y la diplomacia. Todas las opiniones expresadas son personales.
            </p>
          </section>

          {/* Divider */}
          <div className="border-t border-warm-border" />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-sage text-white hover:bg-sage-light active:scale-[0.98] transition-all duration-200"
            >
              Leer los artículos
            </Link>
            <span className="text-ink-muted text-[13px]">
              o escríbeme a{' '}
              <a
                href="mailto:tu@email.com"
                className="text-sage hover:underline font-medium"
              >
                tu@email.com
              </a>
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
