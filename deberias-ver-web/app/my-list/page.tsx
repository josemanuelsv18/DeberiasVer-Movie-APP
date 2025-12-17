'use client';

import { useEffect, useState } from 'react';
import { visualizacionesApi } from '@/lib/api';
import { VisualizacionResponse } from '@/lib/types';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from '@/components/StarRating';
import { useRouter } from 'next/navigation';

export default function MyListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [visualizaciones, setVisualizaciones] = useState<VisualizacionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movies' | 'tv'>('all');

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
        }
      } catch (error) {
        console.error('Error fetching list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRemove = async (id: number) => {
    try {
      await visualizacionesApi.delete(id);
      setVisualizaciones(prev => prev.filter(v => v.visualizacionId !== id));
    } catch (error) {
      console.error('Error removing:', error);
    }
  };

  // Filter logic
  const filteredList = visualizaciones.filter(v => {
    if (filter === 'movies' && v.tipoContenido !== 'Pelicula') return false;
    if (filter === 'tv' && v.tipoContenido !== 'Serie') return false;
    return true;
  });

  // Stats
  const stats = {
    total: visualizaciones.length,
    movies: visualizaciones.filter(v => v.tipoContenido === 'Pelicula').length,
    tv: visualizaciones.filter(v => v.tipoContenido === 'Serie').length,
    rated: visualizaciones.filter(v => v.calificacion).length,
    avgRating: visualizaciones.filter(v => v.calificacion).length > 0
      ? (visualizaciones.filter(v => v.calificacion).reduce((acc, v) => acc + (v.calificacion?.puntuacion || 0), 0) / visualizaciones.filter(v => v.calificacion).length).toFixed(1)
      : 'N/A',
  };

  if (authLoading) return <LoadingPage />;
  if (!isAuthenticated) return null;
  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mi Lista</h1>
          <p className="text-zinc-400">
            Tu colección de películas y series
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Películas</p>
            <p className="text-3xl font-bold text-amber-400">{stats.movies}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Series</p>
            <p className="text-3xl font-bold text-blue-400">{stats.tv}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Calificación promedio</p>
            <p className="text-3xl font-bold text-amber-400">⭐ {stats.avgRating}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilter('movies')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'movies' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎬 Películas
            </button>
            <button
              onClick={() => setFilter('tv')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'tv' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              📺 Series
            </button>
          </div>
        </div>

        {/* Content List */}
        {filteredList.length > 0 ? (
          <div className="grid gap-4">
            {filteredList.map((item) => (
              <div
                key={item.visualizacionId}
                className="flex gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                {/* Poster */}
                <a
                  href={item.tipoContenido === 'Pelicula' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                  className="shrink-0"
                >
                  <div className="relative w-20 h-28 md:w-24 md:h-36 rounded-lg overflow-hidden bg-zinc-800">
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {item.tipoContenido === 'Pelicula' ? '🎬' : '📺'}
                    </div>
                  </div>
                </a>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <a
                        href={item.tipoContenido === 'Pelicula' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                        className="hover:text-amber-400 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-white line-clamp-1">{item.titulo || 'Sin título'}</h3>
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

                    <button
                      onClick={() => handleRemove(item.visualizacionId)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                      title="Eliminar de mi lista"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Rating */}
                  {item.calificacion && (
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating rating={item.calificacion.puntuacion} />
                      <span className="text-white font-bold">{item.calificacion.puntuacion}/10</span>
                    </div>
                  )}

                  {/* Review excerpt */}
                  {item.resena && (
                    <p className="mt-2 text-zinc-400 text-sm line-clamp-2">
                      {item.resena.texto}
                    </p>
                  )}

                  {/* Episodes progress for TV shows */}
                  {item.tipoContenido === 'Serie' && item.episodiosVistos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-zinc-400 text-sm">
                        {item.episodiosVistos.length} episodio{item.episodiosVistos.length !== 1 ? 's' : ''} visto{item.episodiosVistos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Date added */}
                  <p className="mt-2 text-zinc-500 text-xs">
                    Agregado el {new Date(item.fechaVisualizacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📚</p>
            <h2 className="text-2xl font-bold text-white mb-2">
              {visualizaciones.length === 0 ? 'Tu lista está vacía' : 'No hay resultados'}
            </h2>
            <p className="text-zinc-400 mb-6">
              {visualizaciones.length === 0 
                ? 'Explora el catálogo y agrega películas y series a tu lista'
                : 'Intenta con otros filtros'}
            </p>
            {visualizaciones.length === 0 && (
              <div className="flex justify-center gap-4">
                <a
                  href="/movies"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
                >
                  🎬 Ver películas
                </a>
                <a
                  href="/tvshows"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                  📺 Ver series
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
