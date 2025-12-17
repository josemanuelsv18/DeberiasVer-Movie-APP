'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { searchApi, getImageUrl } from '@/lib/api';
import { TmdbMultiSearchResult } from '@/lib/types';
import { LoadingSection } from '@/components/LoadingSpinner';

type SearchResult = TmdbMultiSearchResult;

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await searchApi.multi(query);
        if (response.success && response.data) {
          // Filter out people and only keep movies and TV shows
          const filtered = response.data.results.filter(
            (item: SearchResult) => item.mediaType === 'movie' || item.mediaType === 'tv'
          );
          setResults(filtered);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Separate movies and TV shows
  const movies = results.filter(r => r.mediaType === 'movie');
  const tvShows = results.filter(r => r.mediaType === 'tv');

  return (
    <>
      {/* Search Header */}
      <div className="mb-8">
        {query ? (
          <h1 className="text-3xl font-bold text-white">
            Resultados para &quot;{query}&quot;
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-white">Buscar</h1>
        )}
        {hasSearched && !isLoading && (
          <p className="text-zinc-400 mt-2">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Search Form */}
      <form
        action="/search"
        method="GET"
        className="mb-8"
      >
        <div className="relative max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar películas o series..."
            className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-lg"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
          >
            🔍 Buscar
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <LoadingSection />
      ) : hasSearched ? (
        results.length > 0 ? (
          <div className="space-y-12">
            {/* Movies Section */}
            {movies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Películas ({movies.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((movie) => (
                    <a
                      key={movie.id}
                      href={`/movie/${movie.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-zinc-800 mb-2">
                        {movie.posterPath ? (
                          <Image
                            src={getImageUrl(movie.posterPath, 'w300')}
                            alt={movie.displayTitle}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🎬
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-amber-400 text-sm">⭐ {movie.voteAverage.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {movie.displayTitle}
                      </h3>
                      {movie.displayDate && (
                        <p className="text-zinc-500 text-xs">
                          {new Date(movie.displayDate).getFullYear()}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* TV Shows Section */}
            {tvShows.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Series ({tvShows.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tvShows.map((show) => (
                    <a
                      key={show.id}
                      href={`/tv/${show.id}`}
                      className="group"
                    >
                      <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-zinc-800 mb-2">
                        {show.posterPath ? (
                          <Image
                            src={getImageUrl(show.posterPath, 'w300')}
                            alt={show.displayTitle}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            📺
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-amber-400 text-sm">⭐ {show.voteAverage.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {show.displayTitle}
                      </h3>
                      {show.displayDate && (
                        <p className="text-zinc-500 text-xs">
                          {new Date(show.displayDate).getFullYear()}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <h2 className="text-2xl font-bold text-white mb-2">No se encontraron resultados</h2>
            <p className="text-zinc-400">
              Intenta con otro término de búsqueda
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🎬</p>
          <h2 className="text-2xl font-bold text-white mb-2">¿Qué quieres ver hoy?</h2>
          <p className="text-zinc-400">
            Busca películas, series y más
          </p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingSection />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
