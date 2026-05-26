'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from './AdminShell';
import Markdown from '@/components/Markdown';
import { useAuth } from '@/lib/auth-context';
import { adminCreatePost, adminUpdatePost, PostCreateInput } from '@/lib/api';

const CATEGORIES = ['Seguridad', 'Tecnología', 'Economía', 'Política', 'General'];

interface PostEditorProps {
  mode: 'create' | 'edit';
  initialSlug?: string;
  initialData?: Partial<PostCreateInput>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function PostEditor({ mode, initialSlug, initialData }: PostEditorProps) {
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'General');
  const [readTime, setReadTime] = useState(initialData?.read_time ?? 5);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleTitleChange(value: string) {
    setTitle(value);
    if (mode === 'create') setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSaving(true);

    const payload: PostCreateInput = {
      slug,
      title,
      summary,
      content,
      category,
      read_time: readTime,
      image_url: imageUrl || undefined,
    };

    try {
      if (mode === 'create') {
        await adminCreatePost(token, payload);
      } else {
        await adminUpdatePost(token, initialSlug!, payload);
      }
      router.push('/admin/posts');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(24,15%,15%)]">
              {mode === 'create' ? 'Nuevo artículo' : 'Editar artículo'}
            </h1>
            <p className="text-[hsl(28,8%,44%)] mt-1 text-sm">
              {mode === 'create' ? 'Crea un nuevo análisis geopolítico' : `Editando: ${initialSlug}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              preview
                ? 'bg-[hsl(28,42%,40%)] text-white border-transparent'
                : 'bg-[hsl(38,24%,97%)] text-[hsl(28,8%,44%)] border-[hsl(38,15%,85%)] hover:border-[hsl(28,42%,40%)]/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {preview ? 'Editar' : 'Vista previa'}
          </button>
        </div>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="La batalla por..."
                className="elegant-input w-full px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="la-batalla-por"
                className="elegant-input w-full px-4 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
              Resumen <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={2}
              placeholder="Descripción breve del artículo para portada y SEO..."
              className="elegant-input w-full px-4 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Category + Read time + Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="elegant-input w-full px-4 py-2.5 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Tiempo de lectura (min)
              </label>
              <input
                type="number"
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                min={1}
                max={60}
                className="elegant-input w-full px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                URL imagen destacada
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="elegant-input w-full px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
              Contenido (Markdown) <span className="text-red-500">*</span>
            </label>
            {preview ? (
              <div className="min-h-64 p-6 bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-xl">
                <Markdown content={content} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={20}
                placeholder={`## Introducción\n\nEscribe el cuerpo del artículo en Markdown...\n\n### Sección\n\nTexto con **negrita**, *cursiva* y \`código\`.`}
                className="elegant-input w-full px-4 py-3 text-sm font-mono leading-relaxed resize-y"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[hsl(28,8%,44%)] hover:text-[hsl(24,15%,15%)] bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] hover:border-[hsl(28,42%,40%)]/40 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[hsl(28,42%,40%)] hover:bg-[hsl(28,42%,30%)] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Publicar artículo' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
