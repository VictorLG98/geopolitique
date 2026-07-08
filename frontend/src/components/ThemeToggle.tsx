'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // The no-flash inline script (see layout.tsx) sets the class before paint;
  // here we sync React state to whatever it decided.
  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* localStorage may be unavailable (private mode) — theme still applies */
    }
    setIsDark(dark);
  };

  const toggleTheme = () => {
    const next = !isDark;
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No View Transitions support or reduced motion → swap instantly.
    if (!document.startViewTransition || prefersReduced) {
      applyTheme(next);
      return;
    }

    // Circular reveal: the CSS drives the expanding-mask animation.
    document.startViewTransition(() => flushSync(() => applyTheme(next)));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-warm-border text-ink-muted hover:text-sage hover:border-sage/40 hover:bg-sage-subtle transition-all duration-200"
    >
      {mounted ? (
        isDark ? (
          <Sun weight="regular" className="h-4 w-4" />
        ) : (
          <Moon weight="regular" className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
