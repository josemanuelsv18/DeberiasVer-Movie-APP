'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { tvShowsApi, getImageUrl, getBackdropUrl, visualizacionesApi, calificacionesApi, resenasApi, episodiosApi } from '@/lib/api';
import { TmdbTvShowDetails, TmdbSeasonDetails, VisualizacionResponse, ResenaPublicaResponse } from '@/lib/types';
import { LoadingPage, LoadingSection } from '@/components/LoadingSpinner';
import StarRating, { RatingInput } from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';

export default function TvShowDetailPage() {
  const params = useParams();
  const tvId = Number(params.id);
  const { isAuthenticated } = useAuth();
  
  const [tvShow, setTvShow] = useState<TmdbTvShowDetails | null>(null);
  const [visualization, setVisualization] = useState<VisualizacionResponse | null>(null);
  const [publicReviews, setPublicReviews] = useState<ResenaPublicaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToList, setIsAddingToList] = useState(false);
  
  // Season details
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<TmdbSeasonDetails | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  
  // Rating & Review state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(7);
  const [reviewText, setReviewText] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tvRes, reviewsRes] = await Promise.all([
          tvShowsApi.getDetails(tvId),
          resenasApi.getByContenido(tvId, false),
        ]);

        if (tvRes.success && tvRes.data) {
          setTvShow(tvRes.data);
          // Set first non-special season as default
          const firstRealSeason = tvRes.data.seasons.find(s => s.seasonNumber > 0);
          if (firstRealSeason) {
            setSelectedSeason(firstRealSeason.seasonNumber);
          }
        }

        if (reviewsRes.success && reviewsRes.data) {
          setPublicReviews(reviewsRes.data);
        }

        // Check if user has this in their list
        if (isAuthenticated) {
          try {
            const visRes = await visualizacionesApi.getAll();
            if (visRes.success && visRes.data) {
              const existing = visRes.data.find(v => v.contenidoId === tvId);
              if (existing) {
                setVisualization(existing);
                if (existing.calificacion) setRating(existing.calificacion.puntuacion);
                if (existing.resena) {
                  setReviewText(existing.resena.texto);
                  setHasSpoilers(existing.resena.contieneSpoilers);
                }
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (error) {
        console.error('Error fetching TV show:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tvId, isAuthenticated]);

  // Fetch season details
  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!tvShow) return;
      setLoadingSeasons(true);
      try {
        const res = await tvShowsApi.getSeasonDetails(tvId, selectedSeason);
        if (res.success && res.data) {
          setSeasonDetails(res.data);
        }
      } catch (error) {
        console.error('Error fetching season:', error);
      } finally {
        setLoadingSeasons(false);
      }
    };

    fetchSeasonDetails();
  }, [tvId, selectedSeason, tvShow]);

  const handleAddToList = async () => {
    if (!isAuthenticated || !tvShow) return;
    setIsAddingToList(true);
    try {
      const res = await visualizacionesApi.create({
        contenidoId: tvId,
        tipoId: 2, // Serie
        titulo: tvShow.name,
      });
      if (res.success && res.data) {
        setVisualization(res.data);
      }
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleRemoveFromList = async () => {
    if (!visualization) return;
    try {
      await visualizacionesApi.delete(visualization.visualizacionId);
      setVisualization(null);
    } catch (error) {
      console.error('Error removing from list:', error);
    }
  };

  const handleToggleEpisode = async (episodeId: number) => {
    if (!visualization) return;

    const isWatched = visualization.episodiosVistos.some(
      e => e.temporadaId === selectedSeason && e.episodioId === episodeId
    );

    try {
      if (isWatched) {
        await episodiosApi.desmarcarPorIds(visualization.visualizacionId, selectedSeason, episodeId);
      } else {
        await episodiosApi.marcarVisto({
          visualizacionId: visualization.visualizacionId,
          temporadaId: selectedSeason,
          episodioId: episodeId,
        });
      }

      // Refresh visualization
      const visRes = await visualizacionesApi.getById(visualization.visualizacionId);
      if (visRes.success && visRes.data) {
        setVisualization(visRes.data);
      }
    } catch (error) {
      console.error('Error toggling episode:', error);
    }
  };

  const handleSaveRatingAndReview = async () => {
    if (!visualization) return;
    setIsSaving(true);
    try {
      await calificacionesApi.create({
        visualizacionId: visualization.visualizacionId,
        puntuacion: rating,
      });

      if (reviewText.trim()) {
        await resenasApi.create({
          visualizacionId: visualization.visualizacionId,
          texto: reviewText,
          contieneSpoilers: hasSpoilers,
        });
      }

      const visRes = await visualizacionesApi.getById(visualization.visualizacionId);
      if (visRes.success && visRes.data) {
        setVisualization(visRes.data);
      }

      const reviewsRes = await resenasApi.getByContenido(tvId, false);
      if (reviewsRes.success && reviewsRes.data) {
        setPublicReviews(reviewsRes.data);
      }

      setShowRatingModal(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEpisodeWatched = (episodeId: number): boolean => {
    if (!visualization) return false;
    return visualization.episodiosVistos.some(
      e => e.temporadaId === selectedSeason && e.episodioId === episodeId
    );
  };

  if (isLoading) return <LoadingPage />;
  if (!tvShow) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Serie no encontrada</div>;

  const year = tvShow.firstAirDate ? new Date(tvShow.firstAirDate).getFullYear() : null;
  const trailer = tvShow.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        {tvShow.backdropPath && (
          <Image
            src={getBackdropUrl(tvShow.backdropPath, 'original')}
            alt={tvShow.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0">
              {tvShow.posterPath ? (
                <Image
                  src={getImageUrl(tvShow.posterPath, 'w500')}
                  alt={tvShow.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-6xl">📺</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-500 text-black text-sm font-bold rounded-full">
                Serie
              </span>
              {year && <span className="text-zinc-400">{year}</span>}
              <span className="text-zinc-400">• {tvShow.numberOfSeasons} temporadas</span>
              <span className="text-zinc-400">• {tvShow.numberOfEpisodes} episodios</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tvShow.name}</h1>

            {tvShow.tagline && (
              <p className="text-xl text-zinc-400 italic mb-4">&quot;{tvShow.tagline}&quot;</p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tvShow.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <StarRating rating={tvShow.voteAverage} />
                <span className="text-white font-bold text-lg">{tvShow.voteAverage.toFixed(1)}</span>
                <span className="text-zinc-400">({tvShow.voteCount.toLocaleString()} votos)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              {isAuthenticated ? (
                visualization ? (
                  <>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
                    >
                      {visualization.calificacion ? '✏️ Editar calificación' : '⭐ Calificar'}
                    </button>
                    <button
                      onClick={handleRemoveFromList}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                    >
                      ✓ En mi lista
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddToList}
                    disabled={isAddingToList}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-bold rounded-lg transition-colors"
                  >
                    {isAddingToList ? 'Agregando...' : '+ Agregar a mi lista'}
                  </button>
                )
              ) : (
                <a
                  href="/login"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
                >
                  Inicia sesión para agregar
                </a>
              )}

              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  ▶ Ver Trailer
                </a>
              )}
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3">Sinopsis</h2>
              <p className="text-zinc-300 leading-relaxed">
                {tvShow.overview || 'Sin sinopsis disponible.'}
              </p>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes */}
        {visualization && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Episodios vistos</h2>
            
            {/* Season Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tvShow.seasons
                .filter(s => s.seasonNumber > 0)
                .map((season) => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.seasonNumber)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedSeason === season.seasonNumber
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    Temporada {season.seasonNumber}
                  </button>
                ))}
            </div>

            {/* Episodes List */}
            {loadingSeasons ? (
              <LoadingSection />
            ) : seasonDetails ? (
              <div className="grid gap-3">
                {seasonDetails.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      isEpisodeWatched(episode.id)
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleEpisode(episode.id)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isEpisodeWatched(episode.id)
                          ? 'bg-amber-500 border-amber-500 text-black'
                          : 'border-zinc-600 text-zinc-600 hover:border-amber-500 hover:text-amber-500'
                      }`}
                    >
                      {isEpisodeWatched(episode.id) && '✓'}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">
                        {episode.episodeNumber}. {episode.name}
                      </p>
                      {episode.overview && (
                        <p className="text-zinc-400 text-sm line-clamp-1">{episode.overview}</p>
                      )}
                    </div>

                    {episode.runtime && (
                      <span className="text-zinc-500 text-sm">{episode.runtime} min</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400">No se pudieron cargar los episodios</p>
            )}
          </section>
        )}

        {/* Cast */}
        {tvShow.credits && tvShow.credits.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Reparto</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tvShow.credits.cast.slice(0, 12).map((person) => (
                <div key={person.id} className="text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-zinc-800 mb-2">
                    {person.profilePath ? (
                      <Image
                        src={getImageUrl(person.profilePath, 'w200')}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium text-sm truncate">{person.name}</p>
                  <p className="text-zinc-400 text-xs truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-12 pb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Reseñas de usuarios ({publicReviews.length})</h2>
          {publicReviews.length > 0 ? (
            <div className="space-y-4">
              {publicReviews.map((review) => (
                <div key={review.resenaId} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold">
                          {review.nombreUsuario.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.nombreUsuario}</p>
                        <p className="text-zinc-400 text-sm">
                          {new Date(review.fechaResena).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    {review.puntuacion && (
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-white font-bold">{review.puntuacion}</span>
                      </div>
                    )}
                  </div>
                  {review.contieneSpoilers && (
                    <div className="mb-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded inline-block">
                      ⚠️ Contiene spoilers
                    </div>
                  )}
                  <p className="text-zinc-300">{review.texto}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
          )}
        </section>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-lg border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-6">Calificar &quot;{tvShow.name}&quot;</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-3">Tu puntuación</label>
              <RatingInput value={rating} onChange={setRating} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tu reseña (opcional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                placeholder="Escribe tu opinión sobre esta serie..."
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSpoilers}
                  onChange={(e) => setHasSpoilers(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-zinc-300">Mi reseña contiene spoilers</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRatingAndReview}
                disabled={isSaving}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-bold rounded-lg transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
