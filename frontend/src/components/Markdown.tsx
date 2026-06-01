import React from 'react';

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  // Split by double newline to handle block structures (paragraphs, headers, lists, code)
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="prose max-w-none space-y-6 text-slate-700 leading-relaxed text-lg">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block (fenced or indented)
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const codeLines = lines.slice(1, lines.length - 1).join('\n');
          return (
            <pre key={index} className="p-4 bg-obsidian-card-hover/50 border border-border-subtle rounded-lg overflow-x-auto text-sm text-sand font-mono leading-relaxed">
              <code>{codeLines}</code>
            </pre>
          );
        }

        // ### maps to h2 (article title is h1, so section headings are h2)
        if (trimmed.startsWith('### ')) {
          return (
            <h2 key={index} className="text-xl md:text-2xl font-serif font-bold text-slate-900 mt-8 mb-4 border-b border-border-subtle pb-2">
              {parseInlineMarkdown(trimmed.substring(4))}
            </h2>
          );
        }

        // ## maps to h2 (larger variant)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-10 mb-4 border-b border-border-subtle pb-2">
              {parseInlineMarkdown(trimmed.substring(3))}
            </h2>
          );
        }

        // # maps to h2 (avoid duplicate h1 with page title)
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={index} className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-12 mb-6">
              {parseInlineMarkdown(trimmed.substring(2))}
            </h2>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          const text = trimmed.substring(2);
          return (
            <blockquote key={index} className="pl-4 border-l-2 border-sand italic text-slate-600 py-1 my-4 bg-obsidian-card/45 rounded-r pr-4">
              {parseInlineMarkdown(text)}
            </blockquote>
          );
        }

        // Bullet list
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const items = trimmed.split(/\n[\*\-]\s+/);
          return (
            <ul key={index} className="list-disc pl-6 space-y-2 text-slate-700 my-4">
              {items.map((item, i) => {
                const itemClean = i === 0 ? item.replace(/^[\*\-]\s+/, '') : item;
                return <li key={i}>{parseInlineMarkdown(itemClean)}</li>;
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={index} className="text-justify font-sans leading-relaxed text-slate-700">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Simple parser for inline formatting (**bold**, *italic*, `code`)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match markdown markers
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-obsidian-card border border-border-subtle text-sand rounded text-sm font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
