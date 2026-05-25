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
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ha ocurrido un error al conectar con la API.');
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

export async function createComment(slug: string, author: string, content: string): Promise<Comment> {
  return fetchAPI<Comment>(`/api/posts/${slug}/comments`, {
    method: 'POST',
    body: JSON.stringify({ author, content }),
  });
}

export async function subscribeNewsletter(email: string): Promise<{ id: number; email: string; subscribed_at: string }> {
  return fetchAPI<{ id: number; email: string; subscribed_at: string }>('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
