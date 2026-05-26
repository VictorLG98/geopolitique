'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

export default function RichEditor({ value, onChange, placeholder, onUploadImage }: RichEditorProps) {
  const prevValueRef = useRef(value);
  const imgInputRef  = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Escribe el contenido del artículo...',
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      prevValueRef.current = html;
      onChange(html);
    },
  });

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
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor || !onUploadImage) return;
    setImgUploading(true);
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }

  if (!editor) {
    return <div className="h-96 bg-[hsl(38,24%,97%)] border border-[hsl(38,15%,85%)] rounded-xl animate-pulse" />;
  }

  const btn = (active: boolean) =>
    `px-2 py-1 text-xs font-mono font-semibold rounded transition-colors select-none ${
      active
        ? 'bg-[hsl(28,42%,40%)] text-white'
        : 'text-[hsl(24,15%,15%)] hover:bg-[hsl(28,42%,40%)]/15 hover:text-[hsl(28,42%,30%)]'
    }`;

  return (
    <div className="border border-[hsl(38,15%,85%)] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-[hsl(38,24%,91%)] border-b border-[hsl(38,15%,85%)]">
        <button type="button" title="Deshacer Ctrl+Z" className={btn(false)}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}>↺</button>
        <button type="button" title="Rehacer Ctrl+Y" className={btn(false)}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}>↻</button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Título de sección" className={btn(editor.isActive('heading', { level: 2 }))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>H2</button>
        <button type="button" title="Subtítulo" className={btn(editor.isActive('heading', { level: 3 }))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}>H3</button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Negrita Ctrl+B" className={btn(editor.isActive('bold'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}><strong>B</strong></button>
        <button type="button" title="Cursiva Ctrl+I" className={btn(editor.isActive('italic'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}><em>I</em></button>
        <button type="button" title="Subrayado Ctrl+U" className={btn(editor.isActive('underline'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}>
          <span style={{ textDecoration: 'underline' }}>U</span></button>
        <button type="button" title="Tachado" className={btn(editor.isActive('strike'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}>
          <span style={{ textDecoration: 'line-through' }}>S</span></button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Alinear izquierda" className={btn(editor.isActive({ textAlign: 'left' }))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}>←</button>
        <button type="button" title="Centrar" className={btn(editor.isActive({ textAlign: 'center' }))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}>↔</button>
        <button type="button" title="Alinear derecha" className={btn(editor.isActive({ textAlign: 'right' }))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}>→</button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Lista de viñetas" className={btn(editor.isActive('bulletList'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>• Lista</button>
        <button type="button" title="Lista numerada" className={btn(editor.isActive('orderedList'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>1. Lista</button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Cita" className={btn(editor.isActive('blockquote'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}>&ldquo; Cita</button>
        <button type="button" title="Código inline" className={btn(editor.isActive('code'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}>{'{}'}&nbsp;</button>
        <button type="button" title="Bloque de código" className={btn(editor.isActive('codeBlock'))}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}>```</button>

        <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />

        <button type="button" title="Insertar enlace" className={btn(editor.isActive('link'))}
          onMouseDown={(e) => { e.preventDefault(); handleLink(); }}>Enlace</button>
        <button type="button" title="Separador horizontal" className={btn(false)}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}>— HR</button>

        {onUploadImage && (
          <>
            <span className="w-px h-4 bg-[hsl(38,15%,85%)] mx-0.5" />
            <button
              type="button"
              title="Insertar imagen"
              disabled={imgUploading}
              className={`${btn(false)} flex items-center gap-1 disabled:opacity-50`}
              onMouseDown={(e) => { e.preventDefault(); imgInputRef.current?.click(); }}
            >
              {imgUploading ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              )}
              Imagen
            </button>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          </>
        )}
      </div>

      {/* Bubble menu on text selection */}
      <BubbleMenu editor={editor}>
        <div className="flex items-center gap-0.5 p-1 bg-[hsl(24,15%,15%)] rounded-lg shadow-xl">
          {[
            { label: <strong>B</strong>, active: editor.isActive('bold'),      action: () => editor.chain().focus().toggleBold().run() },
            { label: <em>I</em>,         active: editor.isActive('italic'),    action: () => editor.chain().focus().toggleItalic().run() },
            { label: <span style={{ textDecoration: 'underline' }}>U</span>, active: editor.isActive('underline'), action: () => editor.chain().focus().toggleUnderline().run() },
            { label: 'Enlace',           active: editor.isActive('link'),      action: handleLink },
          ].map((item, i) => (
            <button key={i} type="button"
              onMouseDown={(e) => { e.preventDefault(); item.action(); }}
              className={`px-2 py-1 text-xs rounded text-white transition-colors ${item.active ? 'bg-[hsl(28,42%,40%)]' : 'hover:bg-white/10'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </BubbleMenu>

      {/* ProseMirror editable area */}
      <EditorContent editor={editor} />
    </div>
  );
}
