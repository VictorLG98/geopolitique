'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/admin/dashboard');
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(secret);
      router.replace('/admin/dashboard');
    } catch (err: unknown) {
      const isNetworkError = err instanceof TypeError && err.message.toLowerCase().includes('fetch');
      setError(
        isNetworkError
          ? 'No se puede conectar al servidor. Verifica que el backend esté corriendo en el puerto 8000.'
          : 'Clave incorrecta. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,98%)] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-extrabold text-[hsl(224,50%,10%)]">
            Geopolitiqué<span className="text-[hsl(243,75%,51%)]">.</span>
          </h1>
          <p className="mt-2 text-sm text-[hsl(220,12%,42%)] uppercase tracking-widest font-semibold">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="bg-[hsl(0,0%,100%)] border border-[hsl(220,18%,90%)] rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="secret"
                className="block text-sm font-semibold text-[hsl(224,50%,10%)] mb-2"
              >
                Clave de acceso
              </label>
              <input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="••••••••••••"
                required
                autoFocus
                className="elegant-input w-full px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full py-3 bg-[hsl(243,75%,51%)] hover:bg-[hsl(243,80%,40%)] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-[hsl(220,12%,42%)]">
          Acceso restringido al equipo editorial
        </p>
      </div>
    </div>
  );
}
