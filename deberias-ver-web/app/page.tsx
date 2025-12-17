'use client';

import { useEffect, useState } from 'react';
import { searchApi, moviesApi, tvShowsApi } from '@/lib/api';
import { TmdbMultiSearchResult, TmdbMovie, TmdbTvShow } from '@/lib/types';
import HeroSection from '@/components/HeroSection';
import ContentGrid from '@/components/ContentGrid';
import { LoadingPage } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function Home() {
  const [trending, setTrending] = useState<TmdbMultiSearchResult[]>([]);
  const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<TmdbTvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [trendingRes, moviesRes, tvRes] = await Promise.all([
          searchApi.getTrending('all', 'week', 1),
          moviesApi.getPopular(1),
          tvShowsApi.getPopular(1),
        ]);

        if (trendingRes.success && trendingRes.data) {
          setTrending(trendingRes.data.results);
        }
        
        if (moviesRes.success && moviesRes.data) {
          setPopularMovies(moviesRes.data.results);
        }
        
        if (tvRes.success && tvRes.data) {
          setPopularTvShows(tvRes.data.results);
        }
      } catch (err) {
        setError('Error al cargar el contenido. Verifica que la API esté en ejecución.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const featuredItem = trending[0];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      {featuredItem && <HeroSection item={featuredItem} />}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">🔥 En Tendencia</h2>
          </div>
          <ContentGrid items={trending.slice(0, 10)} type="mixed" />
        </section>

        {/* Popular Movies Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">🎬 Películas Populares</h2>
            <Link 
              href="/movies" 
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Ver todas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ContentGrid items={popularMovies.slice(0, 10)} type="movie" />
        </section>

        {/* Popular TV Shows Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">📺 Series Populares</h2>
            <Link 
              href="/tvshows" 
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Ver todas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ContentGrid items={popularTvShows.slice(0, 10)} type="tv" />
        </section>
      </div>
    </div>
  );
}
