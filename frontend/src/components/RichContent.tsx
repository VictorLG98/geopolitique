'use client';

import React, { useState, useEffect } from 'react';
import Markdown from './Markdown';

interface RichContentProps {
  content: string;
}

export default function RichContent({ content }: RichContentProps) {
  const isHtml = content.trimStart().startsWith('<');
  const [sanitized, setSanitized] = useState<string | null>(null);

  useEffect(() => {
    if (!isHtml) return;
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitized(
        DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
          ADD_ATTR: ['target', 'rel'],
        })
      );
    });
  }, [content, isHtml]);

  if (!isHtml) return <Markdown content={content} />;

  if (sanitized === null) {
    return <div className="rich-content min-h-[200px] animate-pulse" aria-busy="true" />;
  }

  return (
    <div
      className="rich-content"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
