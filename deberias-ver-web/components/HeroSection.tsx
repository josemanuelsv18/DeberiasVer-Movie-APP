'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getBackdropUrl, getImageUrl } from '@/lib/api';
import { TmdbMultiSearchResult } from '@/lib/types';

interface HeroSectionProps {
  item: TmdbMultiSearchResult;
}

export default function HeroSection({ item }: HeroSectionProps) {
  const title = item.displayTitle || item.title || item.name || 'Sin título';
  const type = item.mediaType === 'movie' ? 'movie' : 'tv';
  const href = type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const year = item.displayDate ? new Date(item.displayDate).getFullYear() : null;

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {item.backdropPath ? (
          <Image
            src={getBackdropUrl(item.backdropPath, 'original')}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
        <div className="flex gap-8 items-end">
          {/* Poster */}
          <div className="hidden md:block relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
            {item.posterPath ? (
              <Image
                src={getImageUrl(item.posterPath, 'w500')}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-500 text-black text-sm font-bold rounded-full uppercase">
                {type === 'movie' ? 'Película' : 'Serie'}
              </span>
              <span className="px-3 py-1 bg-zinc-800/80 backdrop-blur-sm text-white text-sm rounded-full">
                🔥 En tendencia
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-zinc-300 mb-4">
              {year && <span>{year}</span>}
              {item.voteAverage !== undefined && item.voteAverage > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  {item.voteAverage.toFixed(1)}
                </span>
              )}
            </div>

            <p className="text-zinc-300 text-lg line-clamp-3 mb-6">
              {item.overview || 'Sin descripción disponible.'}
            </p>

            <div className="flex gap-4">
              <Link
                href={href}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
