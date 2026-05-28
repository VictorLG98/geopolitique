const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time: number;
  image_url?: string;
  published_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author: string;
  content: string;
  created_at: string;
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  const response = await fetch(url, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ha ocurrido un error al conectar con la API.');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getPosts(q?: string, category?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI<Post[]>(`/api/posts${queryString}`, {
    next: { revalidate: 60 } // Incremental Static Regeneration cache settings
  });
}

export async function getPostDetail(slug: string): Promise<PostDetail> {
  // We want to make sure dynamic comments fetch is always fresh when loaded by client, 
  // but let's allow dynamic standard fetch
  return fetchAPI<PostDetail>(`/api/posts/${slug}`, {
    cache: 'no-store' // Avoid caching details so comments show up in real-time
  });
}

export async function createComment(slug: string, author: string, content: string, turnstileToken?: string): Promise<Comment> {
  return fetchAPI<Comment>(`/api/posts/${slug}/comments`, {
    method: 'POST',
    body: JSON.stringify({ author, content, turnstile_token: turnstileToken }),
  });
}

export async function subscribeNewsletter(email: string): Promise<{ id: number; email: string; subscribed_at: string }> {
  return fetchAPI<{ id: number; email: string; subscribed_at: string }>('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ── Admin types ────────────────────────────────────────────────────────────

export interface CommentDetail extends Comment {
  post: { id: number; slug: string; title: string };
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export interface AdminStats {
  posts: number;
  comments: number;
  subscribers: number;
}

export interface PostCreateInput {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time: number;
  image_url?: string;
  published_at?: string;
}

export interface PostUpdateInput {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  read_time?: number;
  image_url?: string;
  published_at?: string;
}

// ── Admin API helpers ──────────────────────────────────────────────────────

function adminFetch<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
  });
}

export async function adminLogin(secret: string): Promise<{ token: string }> {
  return fetchAPI<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ secret }),
  });
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  return adminFetch<AdminStats>('/api/admin/stats', token);
}

export async function adminGetPosts(token: string, q?: string, category?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return adminFetch<Post[]>(`/api/posts${queryString}`, token, { cache: 'no-store' });
}

export async function adminCreatePost(token: string, data: PostCreateInput): Promise<Post> {
  return adminFetch<Post>('/api/admin/posts', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdatePost(token: string, slug: string, data: PostUpdateInput): Promise<Post> {
  return adminFetch<Post>(`/api/admin/posts/${slug}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminDeletePost(token: string, slug: string): Promise<void> {
  return adminFetch<void>(`/api/admin/posts/${slug}`, token, { method: 'DELETE' });
}

export async function getAdminComments(token: string): Promise<CommentDetail[]> {
  return adminFetch<CommentDetail[]>('/api/admin/comments', token);
}

export async function adminDeleteComment(token: string, id: number): Promise<void> {
  return adminFetch<void>(`/api/admin/comments/${id}`, token, { method: 'DELETE' });
}

export async function getNewsletterSubscribers(token: string): Promise<NewsletterSubscriber[]> {
  return adminFetch<NewsletterSubscriber[]>('/api/admin/newsletter', token);
}

export async function adminDeleteSubscriber(token: string, id: number): Promise<void> {
  return adminFetch<void>(`/api/admin/newsletter/${id}`, token, { method: 'DELETE' });
}

export async function adminNotifySubscribers(token: string, slug: string): Promise<{ sent: number; message: string }> {
  return adminFetch<{ sent: number; message: string }>(`/api/admin/posts/${slug}/notify`, token, { method: 'POST' });
}

export async function adminUploadImage(token: string, file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE_URL}/api/admin/upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al subir la imagen');
  }
  return response.json();
}
