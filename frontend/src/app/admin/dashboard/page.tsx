'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/auth-context';
import { getAdminStats, AdminStats } from '@/lib/api';

function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number | null;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-2xl p-6 flex items-center gap-5 hover:border-[hsl(28,42%,36%)]/40 hover:shadow-md transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-[hsl(28,42%,36%)]/10 flex items-center justify-center text-[hsl(28,42%,36%)] group-hover:bg-[hsl(28,42%,36%)]/20 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-serif text-[hsl(24,15%,15%)]">
          {value === null ? (
            <span className="inline-block w-10 h-7 bg-[hsl(38,15%,85%)] rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
        <p className="text-sm text-[hsl(28,8%,37%)] font-medium mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getAdminStats(token)
      .then(setStats)
      .catch(() => setError('No se pudieron cargar las estadísticas.'));
  }, [token]);

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[hsl(24,15%,15%)]">Panel de control</h1>
          <p className="text-[hsl(28,8%,37%)] mt-1 text-sm">Resumen del estado del blog</p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Artículos publicados"
            value={stats?.posts ?? null}
            href="/admin/posts"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            label="Comentarios"
            value={stats?.comments ?? null}
            href="/admin/comments"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatCard
            label="Suscriptores"
            value={stats?.subscribers ?? null}
            href="/admin/newsletter"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[hsl(24,15%,15%)] mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-3 px-5 py-4 bg-[hsl(28,42%,36%)] hover:bg-[hsl(28,42%,30%)] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo artículo
            </Link>
            <Link
              href="/admin/posts"
              className="flex items-center gap-3 px-5 py-4 bg-[hsl(38,24%,97%)] hover:bg-[hsl(38,24%,91%)] border border-[hsl(38,15%,85%)] text-[hsl(24,15%,15%)] rounded-xl font-medium text-sm transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Gestionar artículos
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
