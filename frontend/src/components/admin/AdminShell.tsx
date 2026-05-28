'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  {
    href: '/admin/dashboard',
    label: 'Panel',
    icon: (
      <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/posts',
    label: 'Artículos',
    icon: (
      <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/admin/comments',
    label: 'Comentarios',
    icon: (
      <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/admin/newsletter',
    label: 'Newsletter',
    icon: (
      <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const COLLAPSED_KEY = 'geo_admin_sidebar_collapsed';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(COLLAPSED_KEY);
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed(v => {
      const next = !v;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }

  useEffect(() => {
    if (!isAuthenticated) router.replace('/admin');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col',
          'bg-warm-card border-r border-warm-border',
          'transition-[width,transform] duration-300 ease-in-out',
          'lg:static lg:translate-x-0 overflow-hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          mounted && collapsed ? 'w-[4.25rem]' : 'w-64',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex items-center border-b border-warm-border h-[60px] px-4 shrink-0 gap-2">
          {collapsed ? (
            <Link href="/" aria-label="Geopolitiqué — ir al blog" className="mx-auto">
              <span className="font-serif text-xl font-extrabold text-sage">G</span>
            </Link>
          ) : (
            <Link href="/" className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="font-serif text-xl font-extrabold text-ink whitespace-nowrap">
                Geopolitiqué<span className="text-sage">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sage font-semibold whitespace-nowrap">
                Admin
              </span>
            </Link>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="hidden lg:flex shrink-0 p-1.5 rounded-lg text-ink-muted hover:bg-warm-surface hover:text-ink transition-all duration-200"
          >
            <svg
              aria-hidden="true"
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-label={collapsed ? item.label : undefined}
                className={[
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  active
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-ink-muted hover:bg-warm-surface hover:text-ink',
                ].join(' ')}
              >
                {item.icon}
                {!collapsed && <span className="overflow-hidden">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-warm-border space-y-0.5 shrink-0">
          <Link
            href="/"
            aria-label={collapsed ? 'Ver blog' : undefined}
            className={[
              'flex items-center gap-3 rounded-lg text-sm font-medium text-ink-muted',
              'hover:bg-warm-surface hover:text-ink transition-all duration-200 whitespace-nowrap',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
            ].join(' ')}
          >
            <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {!collapsed && 'Ver blog'}
          </Link>

          <button
            onClick={logout}
            aria-label={collapsed ? 'Cerrar sesión' : undefined}
            className={[
              'w-full flex items-center gap-3 rounded-lg text-sm font-medium',
              'text-red-500 hover:bg-red-50 transition-all duration-200 whitespace-nowrap',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
            ].join(' ')}
          >
            <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && 'Cerrar sesión'}
          </button>

        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-warm-card border-b border-warm-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-muted hover:bg-warm-surface transition-colors"
            aria-label="Abrir menú"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-serif font-bold text-ink">Geopolitiqué Admin</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
