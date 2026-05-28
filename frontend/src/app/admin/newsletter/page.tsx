'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/auth-context';
import { getNewsletterSubscribers, adminDeleteSubscriber, NewsletterSubscriber } from '@/lib/api';

export default function NewsletterPage() {
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadSubscribers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getNewsletterSubscribers(token)
      .then(setSubscribers)
      .catch(() => setError('Error al cargar suscriptores.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  async function handleDelete(id: number, email: string) {
    if (!token) return;
    if (!confirm(`¿Dar de baja a "${email}"?`)) return;
    setDeleting(id);
    try {
      await adminDeleteSubscriber(token, id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('No se pudo eliminar el suscriptor.');
    } finally {
      setDeleting(null);
    }
  }

  function exportCSV() {
    const rows = [
      ['Email', 'Fecha de suscripción'],
      ...subscribers.map((s) => [s.email, new Date(s.subscribed_at).toLocaleString('es-ES')]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter_suscriptores.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subscribers.filter((s) =>
    !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">Newsletter</h1>
            <p className="text-ink-muted mt-1 text-sm">{subscribers.length} suscriptores</p>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-warm-card hover:bg-warm-surface border border-warm-border text-ink rounded-xl font-semibold text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="mb-5">
          <input
            type="text"
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="elegant-input w-full max-w-sm px-4 py-2 text-sm"
          />
        </div>

        <div className="bg-warm-card border border-warm-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-ink-muted text-sm">
              {subscribers.length === 0 ? 'Aún no hay suscriptores.' : 'No hay coincidencias.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted hidden sm:table-cell">
                    Suscrito el
                  </th>
                  <th className="text-right px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-warm-surface transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink">{sub.email}</td>
                    <td className="px-4 py-3.5 text-ink-muted hidden sm:table-cell">
                      {new Date(sub.subscribed_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        disabled={deleting === sub.id}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Dar de baja"
                      >
                        {deleting === sub.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
