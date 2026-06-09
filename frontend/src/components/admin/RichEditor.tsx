'use client';

import React, {
  useState, useRef, useEffect, useMemo, useCallback,
  forwardRef, useImperativeHandle, createContext, useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import type { Range } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TableKit } from '@tiptap/extension-table';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';

// ── Types ────────────────────────────────────────────────────────────────────

interface SlashCommand {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  action: (editor: Editor, range: Range) => void;
  separator?: false;
}
interface Separator { separator: true }
type MenuItem = SlashCommand | Separator;

interface SlashMenuState {
  items: SlashCommand[];
  selectedIndex: number;
  pos: { top: number; left: number };
  range: Range | null;
}

export interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

// ── Slash command definitions ────────────────────────────────────────────────

function buildCommands(onImage: () => void): MenuItem[] {
  return [
    {
      title: 'Párrafo',
      description: 'Texto básico',
      icon: 'T',
      keywords: ['texto', 'parrafo', 'p', 'text'],
      action: (e, r) => e.chain().focus().deleteRange(r).clearNodes().run(),
    },
    {
      title: 'Título grande',
      description: 'Encabezado H1',
      icon: 'H1',
      keywords: ['h1', 'titulo', 'heading', 'cabecera'],
      action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run(),
    },
    {
      title: 'Título medio',
      description: 'Encabezado H2',
      icon: 'H2',
      keywords: ['h2', 'titulo', 'heading'],
      action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run(),
    },
    {
      title: 'Título pequeño',
      description: 'Encabezado H3',
      icon: 'H3',
      keywords: ['h3', 'titulo', 'heading'],
      action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run(),
    },
    { separator: true },
    {
      title: 'Lista de viñetas',
      description: 'Lista sin orden',
      icon: '•',
      keywords: ['lista', 'bullet', 'ul', 'puntos', 'vineta'],
      action: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
    },
    {
      title: 'Lista numerada',
      description: 'Lista con números',
      icon: '1.',
      keywords: ['lista', 'numbered', 'ol', 'numerada'],
      action: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
    },
    {
      title: 'Lista de tareas',
      description: 'Casillas de verificación',
      icon: '☑',
      keywords: ['tareas', 'checklist', 'todo', 'checkbox', 'tasks'],
      action: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
    },
    { separator: true },
    {
      title: 'Cita',
      description: 'Texto destacado en cita',
      icon: '"',
      keywords: ['cita', 'quote', 'blockquote'],
      action: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
    },
    {
      title: 'Bloque de código',
      description: 'Código con resaltado',
      icon: '</>',
      keywords: ['codigo', 'code', 'pre', 'block'],
      action: (e, r) => e.chain().focus().deleteRange(r).toggleCodeBlock().run(),
    },
    {
      title: 'Separador',
      description: 'Línea divisoria horizontal',
      icon: '—',
      keywords: ['separador', 'divider', 'hr', 'linea', 'divisor'],
      action: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
    },
    { separator: true },
    {
      title: 'Imagen',
      description: 'Sube desde tu equipo',
      icon: '🖼',
      keywords: ['imagen', 'image', 'foto', 'photo', 'upload', 'subir'],
      action: (_e, _r) => onImage(),
    },
    {
      title: 'Tabla',
      description: '3×3 con cabecera',
      icon: '⊞',
      keywords: ['tabla', 'table', 'grid', 'filas'],
      action: (e, r) =>
        e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];
}

// ── Slash command menu component ─────────────────────────────────────────────

interface SlashMenuProps {
  state: SlashMenuState;
  onSelect: (item: SlashCommand) => void;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}

function SlashCommandMenu({ state, onSelect, onChangeIndex }: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = menuRef.current?.querySelector('[data-selected]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [state.selectedIndex]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: state.pos.top + 8,
    left: state.pos.left,
    zIndex: 9999,
  };

  // Clamp to viewport
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12)
      el.style.left = `${window.innerWidth - rect.width - 12}px`;
    if (rect.bottom > window.innerHeight - 12)
      el.style.top = `${state.pos.top - rect.height - 8}px`;
  });

  return (
    <div
      ref={menuRef}
      style={style}
      className="w-72 max-h-80 overflow-y-auto bg-white border border-warm-border rounded-xl shadow-xl py-1.5"
    >
      {state.items.length === 0 ? (
        <p className="px-4 py-2 text-xs text-ink-muted">Sin resultados</p>
      ) : (
        (() => {
          let absIdx = 0;
          // Re-build with separators for display
          return (
            <>
              {state.items.map((item, i) => {
                const idx = absIdx++;
                return (
                  <button
                    key={i}
                    data-selected={idx === state.selectedIndex || undefined}
                    onMouseEnter={() => onChangeIndex(idx)}
                    onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      idx === state.selectedIndex
                        ? 'bg-warm-surface'
                        : 'hover:bg-warm-surface'
                    }`}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-warm-surface text-ink text-xs font-bold shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink leading-none mb-0.5">{item.title}</p>
                      <p className="text-xs text-ink-muted truncate">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </>
          );
        })()
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function RichEditor({ value, onChange, placeholder, onUploadImage }: RichEditorProps) {
  const prevValueRef  = useRef(value);
  const imgInputRef   = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);

  // Slash menu state
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const slashMenuRef  = useRef<SlashMenuState | null>(null);
  const slashRangeRef = useRef<Range | null>(null);
  const slashEditorRef = useRef<Editor | null>(null);

  function updateSlashMenu(next: SlashMenuState | null) {
    slashMenuRef.current = next;
    setSlashMenu(next);
  }

  // Image upload helpers
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setImgUploading(true);
    try {
      const url = await onUploadImage(file);
      slashEditorRef.current?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }

  const triggerImgInput = useCallback(() => imgInputRef.current?.click(), []);
  // Build slash commands once
  const allCommands = useMemo<MenuItem[]>(() => buildCommands(triggerImgInput), [triggerImgInput]);

  // Filter commands by query
  function filterCommands(query: string): SlashCommand[] {
    const q = query.toLowerCase().trim();
    const items = allCommands.filter((c): c is SlashCommand => !('separator' in c));
    if (!q) return items;
    return items.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.keywords.some(k => k.includes(q))
    );
  }

  // Create slash extension
  const slashExtension = useMemo(() =>
    Extension.create({
      name: 'slashCommands',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '/',
            allowSpaces: false,
            startOfLine: false,
            items: ({ query }) => filterCommands(query),
            command: ({ editor, range, props }) => {
              (props as SlashCommand).action(editor, range);
            },
            render: () => ({
              onStart(props) {
                slashEditorRef.current = props.editor;
                const rect = props.clientRect?.();
                if (!rect) return;
                slashRangeRef.current = props.range;
                updateSlashMenu({
                  items: props.items as SlashCommand[],
                  selectedIndex: 0,
                  pos: { top: rect.bottom, left: rect.left },
                  range: props.range,
                });
              },
              onUpdate(props) {
                slashEditorRef.current = props.editor;
                const rect = props.clientRect?.();
                slashRangeRef.current = props.range;
                updateSlashMenu(
                  slashMenuRef.current
                    ? {
                        ...slashMenuRef.current,
                        items: props.items as SlashCommand[],
                        selectedIndex: 0,
                        pos: rect ? { top: rect.bottom, left: rect.left } : slashMenuRef.current.pos,
                        range: props.range,
                      }
                    : null
                );
              },
              onKeyDown({ event }) {
                const menu = slashMenuRef.current;
                if (!menu) return false;
                if (event.key === 'ArrowDown') {
                  updateSlashMenu({ ...menu, selectedIndex: (menu.selectedIndex + 1) % Math.max(1, menu.items.length) });
                  return true;
                }
                if (event.key === 'ArrowUp') {
                  updateSlashMenu({ ...menu, selectedIndex: (menu.selectedIndex - 1 + menu.items.length) % Math.max(1, menu.items.length) });
                  return true;
                }
                if (event.key === 'Enter') {
                  const item = menu.items[menu.selectedIndex];
                  if (item && slashRangeRef.current && slashEditorRef.current) {
                    item.action(slashEditorRef.current, slashRangeRef.current);
                  }
                  updateSlashMenu(null);
                  return true;
                }
                if (event.key === 'Escape') {
                  updateSlashMenu(null);
                  return true;
                }
                return false;
              },
              onExit() {
                updateSlashMenu(null);
              },
            }),
          }),
        ];
      },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Título...';
          return placeholder ?? "Escribe '/' para insertar un bloque…";
        },
        includeChildren: true,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CharacterCount,
      Typography,
      slashExtension,
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      prevValueRef.current = html;
      onChange(html);
    },
  });

  // Store editor ref for slash image action
  useEffect(() => {
    if (editor) slashEditorRef.current = editor;
  }, [editor]);

  // Sync external value (draft restore)
  useEffect(() => {
    if (!editor) return;
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  function handleLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL del enlace', prev);
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div className="notion-editor-skeleton border border-warm-border rounded-2xl overflow-hidden">
        <div className="h-12 bg-warm-surface animate-pulse" />
        <div className="h-96 bg-white animate-pulse" />
      </div>
    );
  }

  // Stat counters
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  // Shared bubble button class
  const bBtn = (active: boolean) =>
    `px-2 py-1 text-xs font-semibold rounded transition-colors ${
      active ? 'bg-sage text-white' : 'text-white/90 hover:bg-white/15'
    }`;

  return (
    <div className="notion-editor border border-warm-border rounded-2xl overflow-hidden bg-white">

      {/* ── Slim top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-warm-border bg-warm-card">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold select-none">
          Editor de contenido — escribe <kbd className="px-1 py-0.5 bg-white border border-warm-border rounded text-[10px] font-mono">/</kbd> para insertar bloques
        </p>
        <div className="flex items-center gap-2">
          <button type="button" title="Deshacer" onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run(); }}
            className="p-1 text-ink-muted hover:text-ink transition-colors rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </button>
          <button type="button" title="Rehacer" onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run(); }}
            className="p-1 text-ink-muted hover:text-ink transition-colors rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/>
            </svg>
          </button>
          {onUploadImage && (
            <button type="button" title={imgUploading ? 'Subiendo…' : 'Insertar imagen'} disabled={imgUploading}
              onMouseDown={e => { e.preventDefault(); imgInputRef.current?.click(); }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:text-sage transition-colors rounded hover:bg-warm-surface disabled:opacity-40">
              {imgUploading
                ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              }
              Imagen
            </button>
          )}
        </div>
      </div>

      {/* ── Bubble menu (text selection) ───────────────────────────── */}
      <BubbleMenu editor={editor}>
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-ink rounded-xl shadow-2xl border border-white/10 max-w-sm">
          {/* Format */}
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={bBtn(editor.isActive('bold'))}><strong>B</strong></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={bBtn(editor.isActive('italic'))}><em>I</em></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={bBtn(editor.isActive('underline'))}><span style={{textDecoration:'underline'}}>U</span></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={bBtn(editor.isActive('strike'))}><span style={{textDecoration:'line-through'}}>S</span></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }} className={bBtn(editor.isActive('code'))} title="Código">{'{}'}</button>

          <span className="w-px h-4 bg-white/20 mx-0.5" />

          {/* Headings */}
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({level:1}).run(); }} className={bBtn(editor.isActive('heading',{level:1}))}>H1</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({level:2}).run(); }} className={bBtn(editor.isActive('heading',{level:2}))}>H2</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({level:3}).run(); }} className={bBtn(editor.isActive('heading',{level:3}))}>H3</button>

          <span className="w-px h-4 bg-white/20 mx-0.5" />

          {/* Highlight & color */}
          <button type="button" title="Resaltar amarillo"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run(); }}
            className={`w-5 h-5 rounded ${editor.isActive('highlight',{color:'#fef08a'}) ? 'ring-2 ring-white' : ''}`}
            style={{ background: '#fef08a' }} />
          <button type="button" title="Resaltar verde"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run(); }}
            className={`w-5 h-5 rounded ${editor.isActive('highlight',{color:'#bbf7d0'}) ? 'ring-2 ring-white' : ''}`}
            style={{ background: '#bbf7d0' }} />

          <span className="w-px h-4 bg-white/20 mx-0.5" />

          {/* Link */}
          <button type="button" onMouseDown={e => { e.preventDefault(); handleLink(); }} className={bBtn(editor.isActive('link'))}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </button>

          {/* Clear formatting */}
          <button type="button" title="Quitar formato" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetAllMarks().clearNodes().run(); }}
            className="px-2 py-1 text-xs text-white/60 hover:text-white transition-colors rounded hover:bg-white/15">✕</button>
        </div>
      </BubbleMenu>

      {/* ── Editor content ────────────────────────────────────────── */}
      <EditorContent editor={editor} className="notion-editor-content" />

      {/* ── Hidden image input ────────────────────────────────────── */}
      <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* ── Footer stats ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-warm-border bg-warm-card text-[10px] text-ink-muted font-mono select-none">
        <span>
          <kbd className="px-1 bg-white border border-warm-border rounded text-[9px]">/</kbd>
          {' '}bloques · <kbd className="px-1 bg-white border border-warm-border rounded text-[9px]">Ctrl+B</kbd> negrita ·{' '}
          <kbd className="px-1 bg-white border border-warm-border rounded text-[9px]">Ctrl+I</kbd> cursiva
        </span>
        <span>{wordCount} palabras · {charCount} chars</span>
      </div>

      {/* ── Slash command menu (portal) ────────────────────────────── */}
      {typeof window !== 'undefined' && slashMenu && slashMenu.items.length > 0 &&
        createPortal(
          <SlashCommandMenu
            state={slashMenu}
            onSelect={(item) => {
              if (slashRangeRef.current && slashEditorRef.current) {
                item.action(slashEditorRef.current, slashRangeRef.current);
              }
              updateSlashMenu(null);
            }}
            onClose={() => updateSlashMenu(null)}
            onChangeIndex={(i) => slashMenu && updateSlashMenu({ ...slashMenu, selectedIndex: i })}
          />,
          document.body
        )
      }
    </div>
  );
}
