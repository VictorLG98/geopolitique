'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/auth-context';
import { getAdminComments, adminDeleteComment, CommentDetail } from '@/lib/api';

export default function CommentsPage() {
  const { token } = useAuth();
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadComments = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAdminComments(token)
      .then(setComments)
      .catch(() => setError('Error al cargar comentarios.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleDelete(id: number, author: string) {
    if (!token) return;
    if (!confirm(`¿Eliminar comentario de "${author}"?`)) return;
    setDeleting(id);
    try {
      await adminDeleteComment(token, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('No se pudo eliminar el comentario.');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = comments.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.author.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.post.title.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(24,15%,15%)]">Comentarios</h1>
            <p className="text-[hsl(28,8%,44%)] mt-1 text-sm">{comments.length} comentarios en total</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="mb-5">
          <input
            type="text"
            placeholder="Buscar por autor, contenido o artículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="elegant-input w-full max-w-sm px-4 py-2 text-sm"
          />
        </div>

        <div className="bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[hsl(28,42%,40%)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[hsl(28,8%,44%)] text-sm">
              No hay comentarios que coincidan.
            </div>
          ) : (
            <div className="divide-y divide-[hsl(38,15%,85%)]">
              {filtered.map((comment) => (
                <div key={comment.id} className="px-5 py-4 hover:bg-[hsl(38,24%,91%)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Author + date */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[hsl(24,15%,15%)]">{comment.author}</span>
                        <span className="text-xs text-[hsl(28,8%,44%)]">
                          {new Date(comment.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {/* Content */}
                      <p className="text-sm text-[hsl(24,15%,25%)] line-clamp-3 mb-2">{comment.content}</p>
                      {/* Post link */}
                      <Link
                        href={`/posts/${comment.post.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-[hsl(28,42%,40%)] hover:underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {comment.post.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(comment.id, comment.author)}
                      disabled={deleting === comment.id}
                      className="shrink-0 p-2 rounded-lg text-[hsl(28,8%,44%)] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar comentario"
                    >
                      {deleting === comment.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
