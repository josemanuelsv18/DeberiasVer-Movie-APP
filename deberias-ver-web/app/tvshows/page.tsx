'use client';

import { useEffect, useState } from 'react';
import { tvShowsApi } from '@/lib/api';
import { TmdbTvShow } from '@/lib/types';
import ContentGrid from '@/components/ContentGrid';
import { LoadingSection } from '@/components/LoadingSpinner';

type Category = 'popular' | 'top_rated' | 'on_the_air';

const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'popular', label: 'Populares', icon: '🔥' },
  { key: 'top_rated', label: 'Mejor Calificadas', icon: '⭐' },
  { key: 'on_the_air', label: 'En Emisión', icon: '📺' },
];

export default function TvShowsPage() {
  const [tvShows, setTvShows] = useState<TmdbTvShow[]>([]);
  const [category, setCategory] = useState<Category>('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTvShows = async () => {
      setIsLoading(true);
      try {
        let response;
        switch (category) {
          case 'popular':
            response = await tvShowsApi.getPopular(page);
            break;
          case 'top_rated':
            response = await tvShowsApi.getTopRated(page);
            break;
          case 'on_the_air':
            response = await tvShowsApi.getOnTheAir(page);
            break;
        }

        if (response.success && response.data) {
          setTvShows(response.data.results);
          setTotalPages(Math.min(response.data.totalPages, 500));
        }
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTvShows();
  }, [category, page]);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">📺 Series</h1>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  category === cat.key
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSection />
        ) : (
          <>
            <ContentGrid items={tvShows} type="tv" />
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
              >
                ← Anterior
              </button>
              
              <span className="text-zinc-400">
                Página {page} de {totalPages}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
