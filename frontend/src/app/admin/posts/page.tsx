'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/auth-context';
import { adminGetPosts, adminDeletePost, Post } from '@/lib/api';

const CATEGORIES = ['Seguridad', 'Tecnología', 'Economía', 'Política', 'General'];

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Seguridad: 'bg-blue-100 text-blue-700',
    Tecnología: 'bg-purple-100 text-purple-700',
    Economía: 'bg-green-100 text-green-700',
    Política: 'bg-orange-100 text-orange-700',
  };
  const cls = colors[category] ?? 'bg-[hsl(225,30%,96%)] text-[hsl(220,12%,42%)]';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {category}
    </span>
  );
}

export default function PostsPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  const loadPosts = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminGetPosts(token, search || undefined, filterCategory || undefined)
      .then(setPosts)
      .catch(() => setError('Error al cargar artículos.'))
      .finally(() => setLoading(false));
  }, [token, search, filterCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleDelete(slug: string, title: string) {
    if (!token) return;
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(slug);
    try {
      await adminDeletePost(token, slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      setError('No se pudo eliminar el artículo.');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(224,50%,10%)]">Artículos</h1>
            <p className="text-[hsl(220,12%,42%)] mt-1 text-sm">{posts.length} artículos en total</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(243,75%,51%)] hover:bg-[hsl(243,80%,40%)] text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo artículo
          </Link>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="elegant-input flex-1 min-w-48 px-4 py-2 text-sm"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="elegant-input px-4 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-[hsl(0,0%,100%)] border border-[hsl(220,18%,90%)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[hsl(243,75%,51%)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[hsl(220,12%,42%)] text-sm">
              No hay artículos que coincidan.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(220,18%,90%)]">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[hsl(220,12%,42%)]">Artículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[hsl(220,12%,42%)] hidden sm:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[hsl(220,12%,42%)] hidden md:table-cell">Fecha</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[hsl(220,12%,42%)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,18%,90%)]">
                {filtered.map((post) => (
                  <tr key={post.slug} className="hover:bg-[hsl(225,30%,96%)] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-[hsl(224,50%,10%)] line-clamp-1">{post.title}</p>
                        <p className="text-xs text-[hsl(220,12%,42%)] mt-0.5 font-mono">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <CategoryBadge category={post.category} />
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-[hsl(220,12%,42%)]">
                      {new Date(post.published_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[hsl(220,12%,42%)] hover:text-[hsl(224,50%,10%)] hover:bg-[hsl(220,18%,90%)] transition-colors"
                          title="Ver"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/posts/${post.slug}/edit`}
                          className="p-1.5 rounded-lg text-[hsl(220,12%,42%)] hover:text-[hsl(243,75%,51%)] hover:bg-[hsl(243,75%,51%)]/10 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug, post.title)}
                          disabled={deleting === post.slug}
                          className="p-1.5 rounded-lg text-[hsl(220,12%,42%)] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deleting === post.slug ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
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
