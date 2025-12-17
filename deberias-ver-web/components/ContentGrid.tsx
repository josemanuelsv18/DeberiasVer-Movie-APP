'use client';

import { TmdbMovie, TmdbTvShow, TmdbMultiSearchResult } from '@/lib/types';
import ContentCard from './ContentCard';

interface ContentGridProps {
  items: (TmdbMovie | TmdbTvShow | TmdbMultiSearchResult)[];
  type: 'movie' | 'tv' | 'mixed';
  title?: string;
}

export default function ContentGrid({ items, type, title }: ContentGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <section>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => {
          let itemType: 'movie' | 'tv' = type === 'movie' ? 'movie' : 'tv';
          
          if (type === 'mixed' && 'mediaType' in item) {
            itemType = item.mediaType === 'movie' ? 'movie' : 'tv';
          }
          
          return (
            <ContentCard key={`${itemType}-${item.id}`} item={item} type={itemType} />
          );
        })}
      </div>
    </section>
  );
}
