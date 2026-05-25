import React, { Suspense } from 'react';
import HomeContainer from '@/components/HomeContainer';
import { getPosts, Post } from '@/lib/api';

// Static fallbacks matching the seed content to guarantee the frontend functions perfectly even if the backend is temporarily offline
const FALLBACK_POSTS: Post[] = [
  {
    id: 1,
    slug: "batalla-soberania-artica",
    title: "La Batalla por la Soberanía Ártica: Rutas, Recursos y Tensiones",
    category: "Seguridad",
    read_time: 7,
    summary: "El deshielo del Polo Norte abre nuevas fronteras comerciales y militares. Examinamos las ambiciones de Rusia, el interés de la 'Ruta de la Seda Polar' de China y la respuesta de la OTAN.",
    image_url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80",
    published_at: new Date().toISOString(),
    content: ""
  },
  {
    id: 2,
    slug: "geopolitica-semiconductores-taiwan",
    title: "La Geopolitica de los Semiconductores: El Estrecho de Taiwán y el Monopolio de TSMC",
    category: "Tecnología",
    read_time: 9,
    summary: "Analizamos por qué los microchips se han convertido en el 'nuevo petróleo' y el papel central de la isla de Taiwán en la rivalidad tecnológica y militar entre EE. UU. y China.",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    published_at: new Date().toISOString(),
    content: ""
  },
  {
    id: 3,
    slug: "litio-andino-triangulo-oro",
    title: "El Litio Andino y el Triángulo de Oro: Sudamérica en la Mira Tecnológica",
    category: "Economía",
    read_time: 6,
    summary: "Bolivia, Argentina y Chile concentran el 60% de las reservas mundiales de litio. Evaluamos los retos del nacionalismo de recursos y la competencia entre EE. UU. y China por asegurar la transición verde.",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    published_at: new Date().toISOString(),
    content: ""
  }
];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  let posts: Post[] = [];
  
  try {
    posts = await getPosts();
    // If backend returns empty, use fallbacks
    if (!posts || posts.length === 0) {
      posts = FALLBACK_POSTS;
    }
  } catch (error) {
    console.warn("Backend API fetching failed in page.tsx, using resilient fallback data:", error);
    posts = FALLBACK_POSTS;
  }

  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-6 w-32 bg-slate-800 rounded mx-auto" />
          <div className="h-4 w-48 bg-slate-900 rounded mx-auto" />
        </div>
      </div>
    }>
      <HomeContainer initialPosts={posts} />
    </Suspense>
  );
}
