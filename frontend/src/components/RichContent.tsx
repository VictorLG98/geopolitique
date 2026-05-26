'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import Markdown from './Markdown';

interface RichContentProps {
  content: string;
}

export default function RichContent({ content }: RichContentProps) {
  const isHtml = content.trimStart().startsWith('<');

  if (isHtml) {
    const sanitized =
      typeof window !== 'undefined'
        ? DOMPurify.sanitize(content, {
            USE_PROFILES: { html: true },
            ADD_ATTR: ['target', 'rel'],
          })
        : content;

    return (
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <Markdown content={content} />;
}
