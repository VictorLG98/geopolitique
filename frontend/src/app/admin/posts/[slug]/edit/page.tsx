'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import PostEditor from '@/components/admin/PostEditor';
import AdminShell from '@/components/admin/AdminShell';
import { getPostDetail, PostDetail } from '@/lib/api';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPostDetail(slug)
      .then(setPost)
      .catch(() => setError('No se pudo cargar el artículo.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[hsl(28,42%,36%)] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (error || !post) {
    return (
      <AdminShell>
        <div className="text-center py-20 text-red-600">{error || 'Artículo no encontrado.'}</div>
      </AdminShell>
    );
  }

  return (
    <PostEditor
      mode="edit"
      initialSlug={slug}
      initialData={{
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        read_time: post.read_time,
        image_url: post.image_url,
        published_at: post.published_at.slice(0, 16),
      }}
    />
  );
}
