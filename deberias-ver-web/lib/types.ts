// ========== API Response Types ==========
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// ========== Auth Types ==========
export interface UserInfo {
  id: number;
  nombreUsuario: string;
  nombre?: string;
  email?: string;
  edad: number;
  fechaRegistro: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: UserInfo;
}

export interface RegisterRequest {
  nombreUsuario: string;
  contrasena: string;
  edad: number;
}

export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

// ========== TMDB Types ==========
export interface TmdbMovie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  adult: boolean;
  originalLanguage: string;
}

export interface TmdbMovieDetails extends TmdbMovie {
  genres: TmdbGenre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  homepage: string | null;
  imdbId: string | null;
  productionCompanies: TmdbProductionCompany[];
  credits?: TmdbCredits;
  videos?: TmdbVideoResults;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  originalName: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  originCountry: string[];
  originalLanguage: string;
}

export interface TmdbTvShowDetails extends TmdbTvShow {
  genres: TmdbGenre[];
  episodeRunTime: number[];
  numberOfEpisodes: number;
  numberOfSeasons: number;
  seasons: TmdbSeason[];
  status: string;
  tagline: string | null;
  homepage: string | null;
  lastAirDate: string | null;
  inProduction: boolean;
  networks: TmdbNetwork[];
  productionCompanies: TmdbProductionCompany[];
  credits?: TmdbCredits;
  videos?: TmdbVideoResults;
}

export interface TmdbSeason {
  id: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodeCount: number;
  seasonNumber: number;
}

export interface TmdbSeasonDetails extends TmdbSeason {
  episodes: TmdbEpisode[];
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string | null;
  episodeNumber: number;
  seasonNumber: number;
  voteAverage: number;
  voteCount: number;
  runtime: number | null;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string;
}

export interface TmdbNetwork {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string;
}

export interface TmdbCredits {
  cast: TmdbCast[];
  crew: TmdbCrew[];
}

export interface TmdbCast {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface TmdbCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface TmdbVideoResults {
  results: TmdbVideo[];
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbMovieListResponse {
  page: number;
  results: TmdbMovie[];
  totalPages: number;
  totalResults: number;
}

export interface TmdbTvListResponse {
  page: number;
  results: TmdbTvShow[];
  totalPages: number;
  totalResults: number;
}

export interface TmdbMultiSearchResult {
  id: number;
  mediaType: string;
  title?: string;
  name?: string;
  originalTitle?: string;
  originalName?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  displayTitle: string;
  displayDate?: string;
}

export interface TmdbMultiSearchResponse {
  page: number;
  results: TmdbMultiSearchResult[];
  totalPages: number;
  totalResults: number;
}

export interface TmdbTrendingResponse {
  page: number;
  results: TmdbMultiSearchResult[];
  totalPages: number;
  totalResults: number;
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}

// ========== Visualization Types ==========
export interface VisualizacionResponse {
  visualizacionId: number;
  contenidoId: number;
  titulo: string | null;
  tipoContenido: string;
  fechaVisualizacion: string;
  fechaRegistro?: string;
  posterPath?: string | null;
  estado?: string;
  calificacion: CalificacionInfo | null;
  resena: ResenaInfo | null;
  episodiosVistos: EpisodioVistoInfo[];
}

export interface RegistrarVisualizacionRequest {
  contenidoId: number;
  tipoId: number;
  titulo?: string;
}

export interface CalificacionInfo {
  calificacionId: number;
  puntuacion: number;
  fechaCalificacion: string;
}

export interface CalificacionRequest {
  visualizacionId: number;
  puntuacion: number;
}

export interface ResenaInfo {
  resenaId: number;
  texto: string;
  contieneSpoilers: boolean;
  fechaResena: string;
}

export interface ResenaRequest {
  visualizacionId: number;
  texto: string;
  contieneSpoilers: boolean;
}

export interface ResenaPublicaResponse {
  resenaId: number;
  nombreUsuario: string;
  contenidoId: number;
  tituloContenido: string | null;
  tipoContenido: string;
  texto: string;
  contieneSpoilers: boolean;
  puntuacion: number | null;
  fechaResena: string;
}

export interface EpisodioVistoInfo {
  id: number;
  temporadaId: number;
  episodioId: number;
  fechaVisto: string;
}

export interface EpisodioVistoRequest {
  visualizacionId: number;
  temporadaId: number;
  episodioId: number;
}

export interface EstadisticasUsuarioResponse {
  totalContenidosVistos: number;
  totalPeliculas: number;
  totalSeries: number;
  promedioCalificacion: number | null;
  totalResenas: number;
  totalEpisodiosVistos: number;
}

export interface PromedioCalificacion {
  contenidoId: number;
  promedio: number | null;
  totalCalificaciones: number;
}
