'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from './AdminShell';
import Markdown from '@/components/Markdown';
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

function calcReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const TOOLBAR = [
  { label: 'H2',     title: 'Título de sección',  block: true,  before: '## ' },
  { label: 'H3',     title: 'Subtítulo',           block: true,  before: '### ' },
  { label: 'B',      title: 'Negrita  Ctrl+B',     block: false, before: '**',  after: '**',  placeholder: 'texto' },
  { label: 'I',      title: 'Cursiva  Ctrl+I',     block: false, before: '*',   after: '*',   placeholder: 'texto' },
  { label: '> Cita', title: 'Cita',                block: true,  before: '> ' },
  { label: '• Lista',title: 'Lista de viñetas',    block: true,  before: '* ' },
  { label: '`…`',    title: 'Código inline',       block: false, before: '`',   after: '`',   placeholder: 'código' },
  { label: '```',    title: 'Bloque de código',    block: false, before: '```\n', after: '\n```', placeholder: 'código' },
] as const;

export default function PostEditor({ mode, initialSlug, initialData }: PostEditorProps) {
  const { token } = useAuth();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // ── Markdown insertion helpers ───────────────────────────────────────────

  function insertInline(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = content.slice(s, e) || placeholder;
    const next = content.slice(0, s) + before + selected + after + content.slice(e);
    setContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + selected.length);
    }, 0);
  }

  function insertBlock(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s } = ta;
    const lineStart = content.lastIndexOf('\n', s - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + prefix.length, s + prefix.length);
    }, 0);
  }

  function handleToolbar(action: typeof TOOLBAR[number]) {
    if (action.block) {
      insertBlock(action.before);
    } else {
      insertInline(action.before, action.after ?? '', action.placeholder ?? 'texto');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'b') { e.preventDefault(); insertInline('**', '**', 'texto'); return; }
    if (mod && e.key === 'i') { e.preventDefault(); insertInline('*', '*', 'texto'); return; }
    if (mod && e.key === 's') { e.preventDefault(); submitForm(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart;
      setContent(c => c.slice(0, s) + '  ' + c.slice(ta.selectionEnd));
      setTimeout(() => ta.setSelectionRange(s + 2, s + 2), 0);
    }
  }

  // ── Submit / save ────────────────────────────────────────────────────────

  function submitForm() {
    // Programmatically submit the form to trigger browser validation
    const form = textareaRef.current?.closest('form') as HTMLFormElement | null;
    form?.requestSubmit();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
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

  // ── Shared editor panel (toolbar + textarea) ─────────────────────────────

  const editorArea = (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-[hsl(38,24%,91%)] border border-[hsl(38,15%,85%)] rounded-t-xl">
        {TOOLBAR.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.title}
            onClick={() => handleToolbar(action)}
            className="px-2 py-1 text-xs font-mono font-semibold rounded text-[hsl(24,15%,15%)] hover:bg-[hsl(28,42%,40%)]/15 hover:text-[hsl(28,42%,30%)] transition-colors select-none"
          >
            {action.label}
          </button>
        ))}
        {lastSaved && (
          <span className="ml-auto text-[10px] text-[hsl(28,8%,44%)] pr-1 font-mono">
            guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        required
        rows={22}
        placeholder={'## Introducción\n\nEscribe el contenido aquí...\n\n### Sección\n\n**Negrita**, *cursiva* y `código`.'}
        className="elegant-input w-full px-4 py-3 text-sm font-mono leading-relaxed resize-y rounded-t-none border-t-0"
        style={{ minHeight: '400px' }}
        spellCheck
      />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

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
                Contenido (Markdown) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[hsl(28,8%,44%)] tabular-nums">
                {wordCount} palabras · {readTime} min lectura
              </span>
            </div>

            {/* Split view (desktop) */}
            {splitView ? (
              <div className="grid grid-cols-2 border border-[hsl(38,15%,85%)] rounded-xl overflow-hidden">
                <div className="border-r border-[hsl(38,15%,85%)]">{editorArea}</div>
                <div className="bg-[hsl(38,24%,97%)] overflow-y-auto" style={{ maxHeight: 600 }}>
                  <p className="text-[10px] uppercase tracking-widest text-[hsl(28,8%,44%)] font-semibold px-6 pt-4 pb-2">
                    Vista previa
                  </p>
                  <div className="px-6 pb-6">
                    <Markdown content={content} />
                  </div>
                </div>
              </div>
            ) : mobilePreview ? (
              <div className="min-h-64 p-6 bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-xl">
                <Markdown content={content} />
              </div>
            ) : (
              editorArea
            )}

            {/* Keyboard shortcut hints */}
            <p className="mt-2 text-xs text-[hsl(28,8%,44%)]">
              {[
                ['Ctrl+B', 'negrita'],
                ['Ctrl+I', 'cursiva'],
                ['Ctrl+S', 'guardar'],
                ['Tab', 'indentar'],
              ].map(([key, label]) => (
                <span key={key} className="mr-3 inline-block">
                  <kbd className="px-1.5 py-0.5 bg-[hsl(38,24%,91%)] border border-[hsl(38,15%,85%)] rounded text-[10px] font-mono">
                    {key}
                  </kbd>
                  {' '}{label}
                </span>
              ))}
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
