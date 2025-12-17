import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TmdbMovieListResponse,
  TmdbTvListResponse,
  TmdbMovieDetails,
  TmdbTvShowDetails,
  TmdbSeasonDetails,
  TmdbMultiSearchResponse,
  TmdbTrendingResponse,
  TmdbGenreListResponse,
  VisualizacionResponse,
  RegistrarVisualizacionRequest,
  CalificacionInfo,
  CalificacionRequest,
  ResenaInfo,
  ResenaRequest,
  ResenaPublicaResponse,
  EpisodioVistoInfo,
  EpisodioVistoRequest,
  EstadisticasUsuarioResponse,
  PromedioCalificacion,
  UserInfo,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7140';

// ========== Helper Functions ==========

// Función para convertir snake_case a camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Función para normalizar objeto de snake_case a camelCase recursivamente
function normalizeKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeKeys(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      normalized[camelKey] = normalizeKeys(value);
    }
    return normalized as T;
  }
  
  return obj as T;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new Error(error.message || `Error: ${response.status}`);
  }

  const data = await response.json();
  // Normalizar las claves del JSON de snake_case a camelCase
  return normalizeKeys<T>(data);
}

// ========== Auth API ==========
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    return fetchApi<ApiResponse<UserInfo>>('/api/auth/profile');
  },

  verifyToken: async (): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>('/api/auth/verify');
  },

  checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean; username: string }>> => {
    return fetchApi<ApiResponse<{ available: boolean; username: string }>>(`/api/auth/check-username/${encodeURIComponent(username)}`);
  },
};

// ========== Movies API ==========
export const moviesApi = {
  getPopular: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMovieListResponse>> => {
    return fetchApi<ApiResponse<TmdbMovieListResponse>>(`/api/movies/popular?page=${page}&language=${language}`);
  },

  getTopRated: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMovieListResponse>> => {
    return fetchApi<ApiResponse<TmdbMovieListResponse>>(`/api/movies/top-rated?page=${page}&language=${language}`);
  },

  getNowPlaying: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMovieListResponse>> => {
    return fetchApi<ApiResponse<TmdbMovieListResponse>>(`/api/movies/now-playing?page=${page}&language=${language}`);
  },

  getUpcoming: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMovieListResponse>> => {
    return fetchApi<ApiResponse<TmdbMovieListResponse>>(`/api/movies/upcoming?page=${page}&language=${language}`);
  },

  search: async (query: string, page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMovieListResponse>> => {
    return fetchApi<ApiResponse<TmdbMovieListResponse>>(`/api/movies/search?query=${encodeURIComponent(query)}&page=${page}&language=${language}`);
  },

  getDetails: async (movieId: number, language = 'es-ES'): Promise<ApiResponse<TmdbMovieDetails>> => {
    return fetchApi<ApiResponse<TmdbMovieDetails>>(`/api/movies/${movieId}?language=${language}`);
  },

  getGenres: async (language = 'es-ES'): Promise<ApiResponse<TmdbGenreListResponse>> => {
    return fetchApi<ApiResponse<TmdbGenreListResponse>>(`/api/movies/genres?language=${language}`);
  },
};

// ========== TV Shows API ==========
export const tvShowsApi = {
  getPopular: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbTvListResponse>> => {
    return fetchApi<ApiResponse<TmdbTvListResponse>>(`/api/tvshows/popular?page=${page}&language=${language}`);
  },

  getTopRated: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbTvListResponse>> => {
    return fetchApi<ApiResponse<TmdbTvListResponse>>(`/api/tvshows/top-rated?page=${page}&language=${language}`);
  },

  getOnTheAir: async (page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbTvListResponse>> => {
    return fetchApi<ApiResponse<TmdbTvListResponse>>(`/api/tvshows/on-the-air?page=${page}&language=${language}`);
  },

  search: async (query: string, page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbTvListResponse>> => {
    return fetchApi<ApiResponse<TmdbTvListResponse>>(`/api/tvshows/search?query=${encodeURIComponent(query)}&page=${page}&language=${language}`);
  },

  getDetails: async (tvId: number, language = 'es-ES'): Promise<ApiResponse<TmdbTvShowDetails>> => {
    return fetchApi<ApiResponse<TmdbTvShowDetails>>(`/api/tvshows/${tvId}?language=${language}`);
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number, language = 'es-ES'): Promise<ApiResponse<TmdbSeasonDetails>> => {
    return fetchApi<ApiResponse<TmdbSeasonDetails>>(`/api/tvshows/${tvId}/season/${seasonNumber}?language=${language}`);
  },

  getGenres: async (language = 'es-ES'): Promise<ApiResponse<TmdbGenreListResponse>> => {
    return fetchApi<ApiResponse<TmdbGenreListResponse>>(`/api/tvshows/genres?language=${language}`);
  },
};

// ========== Search API ==========
export const searchApi = {
  multi: async (query: string, page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbMultiSearchResponse>> => {
    return fetchApi<ApiResponse<TmdbMultiSearchResponse>>(`/api/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=${language}`);
  },

  getTrending: async (mediaType = 'all', timeWindow = 'week', page = 1, language = 'es-ES'): Promise<ApiResponse<TmdbTrendingResponse>> => {
    return fetchApi<ApiResponse<TmdbTrendingResponse>>(`/api/search/trending?mediaType=${mediaType}&timeWindow=${timeWindow}&page=${page}&language=${language}`);
  },
};

// ========== Visualizaciones API ==========
export const visualizacionesApi = {
  getAll: async (): Promise<ApiResponse<VisualizacionResponse[]>> => {
    return fetchApi<ApiResponse<VisualizacionResponse[]>>('/api/visualizaciones');
  },

  getById: async (id: number): Promise<ApiResponse<VisualizacionResponse>> => {
    return fetchApi<ApiResponse<VisualizacionResponse>>(`/api/visualizaciones/${id}`);
  },

  create: async (data: RegistrarVisualizacionRequest): Promise<ApiResponse<VisualizacionResponse>> => {
    return fetchApi<ApiResponse<VisualizacionResponse>>('/api/visualizaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>(`/api/visualizaciones/${id}`, {
      method: 'DELETE',
    });
  },

  getEstadisticas: async (): Promise<ApiResponse<EstadisticasUsuarioResponse>> => {
    return fetchApi<ApiResponse<EstadisticasUsuarioResponse>>('/api/visualizaciones/estadisticas');
  },
};

// ========== Calificaciones API ==========
export const calificacionesApi = {
  create: async (data: CalificacionRequest): Promise<ApiResponse<CalificacionInfo>> => {
    return fetchApi<ApiResponse<CalificacionInfo>>('/api/calificaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (visualizacionId: number): Promise<ApiResponse<CalificacionInfo>> => {
    return fetchApi<ApiResponse<CalificacionInfo>>(`/api/calificaciones/${visualizacionId}`);
  },

  delete: async (visualizacionId: number): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>(`/api/calificaciones/${visualizacionId}`, {
      method: 'DELETE',
    });
  },

  getPromedioContenido: async (contenidoId: number): Promise<ApiResponse<PromedioCalificacion>> => {
    return fetchApi<ApiResponse<PromedioCalificacion>>(`/api/calificaciones/contenido/${contenidoId}/promedio`);
  },
};

// ========== Reseñas API ==========
export const resenasApi = {
  create: async (data: ResenaRequest): Promise<ApiResponse<ResenaInfo>> => {
    return fetchApi<ApiResponse<ResenaInfo>>('/api/resenas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (visualizacionId: number): Promise<ApiResponse<ResenaInfo>> => {
    return fetchApi<ApiResponse<ResenaInfo>>(`/api/resenas/${visualizacionId}`);
  },

  delete: async (visualizacionId: number): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>(`/api/resenas/${visualizacionId}`, {
      method: 'DELETE',
    });
  },

  getByContenido: async (contenidoId: number, ocultarSpoilers = true): Promise<ApiResponse<ResenaPublicaResponse[]>> => {
    return fetchApi<ApiResponse<ResenaPublicaResponse[]>>(`/api/resenas/contenido/${contenidoId}?ocultarSpoilers=${ocultarSpoilers}`);
  },

  getRecientes: async (cantidad = 10, ocultarSpoilers = true): Promise<ApiResponse<ResenaPublicaResponse[]>> => {
    return fetchApi<ApiResponse<ResenaPublicaResponse[]>>(`/api/resenas/recientes?cantidad=${cantidad}&ocultarSpoilers=${ocultarSpoilers}`);
  },
};

// ========== Episodios API ==========
export const episodiosApi = {
  marcarVisto: async (data: EpisodioVistoRequest): Promise<ApiResponse<EpisodioVistoInfo>> => {
    return fetchApi<ApiResponse<EpisodioVistoInfo>>('/api/episodios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  marcarVistoBulk: async (data: EpisodioVistoRequest[]): Promise<ApiResponse<EpisodioVistoInfo[]>> => {
    return fetchApi<ApiResponse<EpisodioVistoInfo[]>>('/api/episodios/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByVisualizacion: async (visualizacionId: number): Promise<ApiResponse<EpisodioVistoInfo[]>> => {
    return fetchApi<ApiResponse<EpisodioVistoInfo[]>>(`/api/episodios/visualizacion/${visualizacionId}`);
  },

  desmarcar: async (id: number): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>(`/api/episodios/${id}`, {
      method: 'DELETE',
    });
  },

  desmarcarPorIds: async (visualizacionId: number, temporadaId: number, episodioId: number): Promise<ApiResponse<boolean>> => {
    return fetchApi<ApiResponse<boolean>>(`/api/episodios/visualizacion/${visualizacionId}/temporada/${temporadaId}/episodio/${episodioId}`, {
      method: 'DELETE',
    });
  },
};

// ========== Image Helpers ==========
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return '/placeholder-backdrop.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};
