'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { visualizacionesApi } from '@/lib/api';
import { VisualizacionResponse } from '@/lib/types';
import { LoadingPage } from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [visualizaciones, setVisualizaciones] = useState<VisualizacionResponse[]>([]);
  const [recentReviews, setRecentReviews] = useState<VisualizacionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const response = await visualizacionesApi.getAll();
        if (response.success && response.data) {
          setVisualizaciones(response.data);
          // Get items with reviews
          setRecentReviews(response.data.filter(v => v.resena).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Calculate stats
  const stats = {
    totalContent: visualizaciones.length,
    movies: visualizaciones.filter(v => v.tipoContenido === 'Pelicula').length,
    tvShows: visualizaciones.filter(v => v.tipoContenido === 'Serie').length,
    reviews: visualizaciones.filter(v => v.resena).length,
    ratings: visualizaciones.filter(v => v.calificacion).length,
    avgRating: visualizaciones.filter(v => v.calificacion).length > 0
      ? (visualizaciones.reduce((acc, v) => acc + (v.calificacion?.puntuacion || 0), 0) / visualizaciones.filter(v => v.calificacion).length)
      : 0,
    episodesWatched: visualizaciones.reduce((acc, v) => acc + v.episodiosVistos.length, 0),
  };

  if (authLoading) return <LoadingPage />;
  if (!isAuthenticated) return null;
  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-8 mb-8 border border-amber-500/30">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-4xl font-bold text-black">
              {user?.nombreUsuario?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {user?.nombreUsuario || 'Usuario'}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Miembro desde {user?.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'hace un tiempo'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl font-bold text-white mb-1">{stats.totalContent}</p>
            <p className="text-zinc-400 text-sm">En mi lista</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl font-bold text-amber-400 mb-1">{stats.movies}</p>
            <p className="text-zinc-400 text-sm">Películas</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl font-bold text-blue-400 mb-1">{stats.tvShows}</p>
            <p className="text-zinc-400 text-sm">Series</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl font-bold text-green-400 mb-1">{stats.reviews}</p>
            <p className="text-zinc-400 text-sm">Reseñas</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-2xl">
                ⭐
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-zinc-400 text-sm">Calificación promedio</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.reviews}</p>
                <p className="text-zinc-400 text-sm">Reseñas escritas</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
                📺
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.episodesWatched}</p>
                <p className="text-zinc-400 text-sm">Episodios vistos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Mis reseñas recientes</h2>
            <div className="space-y-4">
              {recentReviews.map((item) => (
                <div
                  key={item.visualizacionId}
                  className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
                >
                  <div className="flex gap-4">
                    <a
                      href={item.tipoContenido === 'Pelicula' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                      className="shrink-0"
                    >
                      <div className="w-16 h-24 rounded-lg overflow-hidden bg-zinc-800">
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {item.tipoContenido === 'Pelicula' ? '🎬' : '📺'}
                        </div>
                      </div>
                    </a>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <a
                            href={item.tipoContenido === 'Pelicula' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                            className="text-lg font-bold text-white hover:text-amber-400 transition-colors"
                          >
                            {item.titulo || 'Sin título'}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              item.tipoContenido === 'Pelicula'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.tipoContenido === 'Pelicula' ? 'Película' : 'Serie'}
                            </span>
                          </div>
                        </div>
                        {item.calificacion && (
                          <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded">
                            <span className="text-amber-400">⭐</span>
                            <span className="text-white font-bold">{item.calificacion.puntuacion}</span>
                          </div>
                        )}
                      </div>
                      {item.resena && (
                        <p className="mt-3 text-zinc-300 line-clamp-3">{item.resena.texto}</p>
                      )}
                      {item.resena && (
                        <p className="mt-2 text-zinc-500 text-xs">
                          {new Date(item.resena.fechaResena).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/my-list"
              className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-colors group"
            >
              <p className="text-3xl mb-3">📚</p>
              <p className="text-white font-bold group-hover:text-amber-400 transition-colors">Ver mi lista</p>
              <p className="text-zinc-400 text-sm">Administra tu colección</p>
            </a>
            <a
              href="/movies"
              className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-colors group"
            >
              <p className="text-3xl mb-3">🎬</p>
              <p className="text-white font-bold group-hover:text-amber-400 transition-colors">Explorar películas</p>
              <p className="text-zinc-400 text-sm">Descubre nuevas películas</p>
            </a>
            <a
              href="/tvshows"
              className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-colors group"
            >
              <p className="text-3xl mb-3">📺</p>
              <p className="text-white font-bold group-hover:text-amber-400 transition-colors">Explorar series</p>
              <p className="text-zinc-400 text-sm">Encuentra tu próxima serie</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
