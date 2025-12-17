'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { TmdbMovie, TmdbTvShow, TmdbMultiSearchResult } from '@/lib/types';

interface ContentCardProps {
  item: TmdbMovie | TmdbTvShow | TmdbMultiSearchResult;
  type: 'movie' | 'tv';
}

function isMovie(item: TmdbMovie | TmdbTvShow | TmdbMultiSearchResult): item is TmdbMovie {
  return 'title' in item && !('mediaType' in item);
}

function isTvShow(item: TmdbMovie | TmdbTvShow | TmdbMultiSearchResult): item is TmdbTvShow {
  return 'name' in item && !('mediaType' in item);
}

export default function ContentCard({ item, type }: ContentCardProps) {
  const title = isMovie(item) ? item.title : isTvShow(item) ? item.name : item.displayTitle || item.title || item.name || 'Sin título';
  const releaseDate = isMovie(item) ? item.releaseDate : isTvShow(item) ? item.firstAirDate : item.displayDate;
  const posterPath = item.posterPath;
  const voteAverage = item.voteAverage;
  
  // Determinar el tipo correcto para búsquedas múltiples
  let contentType = type;
  if ('mediaType' in item) {
    contentType = item.mediaType === 'movie' ? 'movie' : 'tv';
  }

  const href = contentType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <Link href={href} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
        {posterPath ? (
          <Image
            src={getImageUrl(posterPath, 'w500')}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        
        {/* Rating Badge */}
        {voteAverage !== undefined && voteAverage > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-black text-xs font-bold uppercase">
            {contentType === 'movie' ? 'Película' : 'Serie'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="mt-3">
        <h3 className="text-white font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-zinc-400 text-sm mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}
