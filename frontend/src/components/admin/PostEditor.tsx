'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from './AdminShell';
import RichEditor from './RichEditor';
import RichContent from '@/components/RichContent';
import { useAuth } from '@/lib/auth-context';
import { adminCreatePost, adminUpdatePost, PostCreateInput } from '@/lib/api';

const CATEGORIES = ['Seguridad', 'Tecnología', 'Economía', 'Política', 'General'];
const SUMMARY_MAX = 1000;
const DRAFT_KEY = 'geo_post_draft';

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

function stripHtml(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, ' ');
}

function calcReadTime(html: string): number {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function isContentEmpty(html: string): boolean {
  return stripHtml(html).trim() === '';
}

export default function PostEditor({ mode, initialSlug, initialData }: PostEditorProps) {
  const { token } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle]       = useState(initialData?.title     ?? '');
  const [slug, setSlug]         = useState(initialData?.slug      ?? '');
  const [summary, setSummary]   = useState(initialData?.summary   ?? '');
  const [content, setContent]   = useState(initialData?.content   ?? '');
  const [category, setCategory] = useState(initialData?.category  ?? 'General');
  const [readTime, setReadTime] = useState(initialData?.read_time ?? 5);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');
  const [imgOk, setImgOk]       = useState(!!initialData?.image_url);

  const [splitView, setSplitView]         = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [hasDraft, setHasDraft]           = useState(false);
  const [lastSaved, setLastSaved]         = useState<Date | null>(null);

  // Check for saved draft on mount (create mode only)
  useEffect(() => {
    if (mode !== 'create') return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.title || d.content) setHasDraft(true);
      } catch { /* ignore corrupt draft */ }
    }
  }, [mode]);

  // Auto-save draft every 30 s (create mode only)
  useEffect(() => {
    if (mode !== 'create') return;
    const id = setInterval(() => {
      if (!title && !content) return;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, slug, summary, content, category, readTime, imageUrl }));
      setLastSaved(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, [mode, title, slug, summary, content, category, readTime, imageUrl]);

  // Auto read-time from word count
  useEffect(() => {
    if (content) setReadTime(calcReadTime(content));
  }, [content]);

  // Ctrl+S — submit form from anywhere
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Draft helpers ────────────────────────────────────────────────────────

  function restoreDraft() {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      setTitle(d.title ?? '');
      setSlug(d.slug ?? '');
      setSummary(d.summary ?? '');
      setContent(d.content ?? '');
      setCategory(d.category ?? 'General');
      setReadTime(d.readTime ?? 5);
      setImageUrl(d.imageUrl ?? '');
      setHasDraft(false);
    } catch { /* ignore */ }
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }

  // ── Submit / save ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (isContentEmpty(content)) {
      setError('El contenido no puede estar vacío.');
      return;
    }

    setError('');
    setSaving(true);

    const payload: PostCreateInput = {
      slug, title, summary, content, category,
      read_time: readTime,
      image_url: imageUrl || undefined,
    };

    try {
      if (mode === 'create') {
        await adminCreatePost(token, payload);
        localStorage.removeItem(DRAFT_KEY);
      } else {
        await adminUpdatePost(token, initialSlug!, payload);
      }
      router.push('/admin/posts');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const wordCount = stripHtml(content).trim().split(/\s+/).filter(Boolean).length;

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(24,15%,15%)]">
              {mode === 'create' ? 'Nuevo artículo' : 'Editar artículo'}
            </h1>
            <p className="text-[hsl(28,8%,44%)] mt-1 text-sm">
              {mode === 'create' ? 'Crea un nuevo análisis geopolítico' : `Editando: ${initialSlug}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Split view — desktop only */}
            <button
              type="button"
              onClick={() => setSplitView(v => !v)}
              title="Vista dividida editor / preview"
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                splitView
                  ? 'bg-[hsl(28,42%,40%)] text-white border-transparent'
                  : 'bg-[hsl(38,24%,97%)] text-[hsl(28,8%,44%)] border-[hsl(38,15%,85%)] hover:border-[hsl(28,42%,40%)]/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10" />
              </svg>
              Vista dividida
            </button>
            {/* Mobile preview toggle */}
            <button
              type="button"
              onClick={() => setMobilePreview(v => !v)}
              className={`lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                mobilePreview
                  ? 'bg-[hsl(28,42%,40%)] text-white border-transparent'
                  : 'bg-[hsl(38,24%,97%)] text-[hsl(28,8%,44%)] border-[hsl(38,15%,85%)]'
              }`}
            >
              {mobilePreview ? 'Editar' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Draft restore banner */}
        {hasDraft && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-amber-800 font-medium">Tienes un borrador sin publicar.</span>
            <button onClick={restoreDraft}
              className="ml-auto text-amber-700 font-semibold hover:text-amber-900 underline underline-offset-2">
              Restaurar
            </button>
            <button onClick={discardDraft} className="text-amber-500 hover:text-amber-700 text-xs">
              Descartar
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

          {/* Title + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (mode === 'create') setSlug(slugify(e.target.value));
                }}
                required
                placeholder="La batalla por la soberanía ártica..."
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
                placeholder="la-batalla-por-la-soberania-artica"
                className="elegant-input w-full px-4 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Summary with char counter */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-semibold text-[hsl(24,15%,15%)]">
                Resumen <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-mono tabular-nums transition-colors ${
                summary.length > SUMMARY_MAX * 0.9 ? 'text-red-500 font-semibold' : 'text-[hsl(28,8%,44%)]'
              }`}>
                {summary.length} / {SUMMARY_MAX}
              </span>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, SUMMARY_MAX))}
              required
              rows={2}
              maxLength={SUMMARY_MAX}
              placeholder="Descripción breve para la portada y el SEO (aparece debajo del título en las tarjetas)..."
              className="elegant-input w-full px-4 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Category + Read time + Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="elegant-input w-full px-4 py-2.5 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">
                Tiempo de lectura
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-[hsl(28,42%,40%)]/10 text-[hsl(28,42%,40%)] font-semibold">
                  auto
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={readTime}
                  onChange={(e) => setReadTime(Math.max(1, Number(e.target.value)))}
                  min={1} max={60}
                  className="elegant-input w-full px-4 py-2.5 text-sm pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(28,8%,44%)] pointer-events-none">min</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[hsl(24,15%,15%)] mb-1.5">URL imagen destacada</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImgOk(false); }}
                placeholder="https://images.unsplash.com/..."
                className="elegant-input w-full px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[hsl(38,15%,85%)] bg-[hsl(38,24%,91%)] aspect-video max-h-52 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Vista previa imagen"
                onLoad={() => setImgOk(true)}
                onError={() => setImgOk(false)}
                className="w-full h-full object-cover"
                style={{ display: imgOk ? 'block' : 'none' }}
              />
              {!imgOk && (
                <span className="text-sm text-[hsl(28,8%,44%)]">
                  {imageUrl ? 'Cargando imagen...' : ''}
                </span>
              )}
            </div>
          )}

          {/* Content editor */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-semibold text-[hsl(24,15%,15%)]">
                Contenido <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[hsl(28,8%,44%)] tabular-nums">
                {wordCount} palabras · {readTime} min lectura
              </span>
            </div>

            {splitView ? (
              <div className="grid grid-cols-2 border border-[hsl(38,15%,85%)] rounded-xl overflow-hidden">
                <div className="border-r border-[hsl(38,15%,85%)]">
                  <RichEditor value={content} onChange={setContent} />
                </div>
                <div className="bg-[hsl(38,24%,97%)] overflow-y-auto" style={{ maxHeight: 600 }}>
                  <p className="text-[10px] uppercase tracking-widest text-[hsl(28,8%,44%)] font-semibold px-6 pt-4 pb-2">
                    Vista previa
                  </p>
                  <div className="px-6 pb-6">
                    <RichContent content={content} />
                  </div>
                </div>
              </div>
            ) : mobilePreview ? (
              <div className="min-h-64 p-6 bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-xl">
                <RichContent content={content} />
              </div>
            ) : (
              <RichEditor value={content} onChange={setContent} />
            )}

            {/* Keyboard shortcut hints */}
            <p className="mt-2 text-xs text-[hsl(28,8%,44%)]">
              {[
                ['Ctrl+B', 'negrita'],
                ['Ctrl+I', 'cursiva'],
                ['Ctrl+Z', 'deshacer'],
                ['Ctrl+S', 'guardar'],
              ].map(([key, label]) => (
                <span key={key} className="mr-3 inline-block">
                  <kbd className="px-1.5 py-0.5 bg-[hsl(38,24%,91%)] border border-[hsl(38,15%,85%)] rounded text-[10px] font-mono">
                    {key}
                  </kbd>
                  {' '}{label}
                </span>
              ))}
              {lastSaved && (
                <span className="ml-2 text-[hsl(28,8%,44%)] font-mono">
                  · guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[hsl(38,15%,85%)]">
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
              className="px-6 py-2.5 bg-[hsl(28,42%,40%)] hover:bg-[hsl(28,42%,30%)] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-md"
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Publicar artículo' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
