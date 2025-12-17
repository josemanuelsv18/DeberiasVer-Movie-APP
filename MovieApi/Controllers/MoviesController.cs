using Microsoft.AspNetCore.Mvc;
using MovieApi.DTOs;
using MovieApi.DTOs.TMDB;
using MovieApi.Services;

namespace MovieApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;
        private readonly ILogger<MoviesController> _logger;

        public MoviesController(ITmdbService tmdbService, ILogger<MoviesController> logger)
        {
            _tmdbService = tmdbService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene las películas populares del momento
        /// </summary>
        [HttpGet("popular")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieListResponse>), 200)]
        public async Task<IActionResult> GetPopularMovies([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetPopularMoviesAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieListResponse>.Error("No se pudieron obtener las películas populares"));
            }

            return Ok(ApiResponse<TmdbMovieListResponse>.Ok(result, "Películas populares obtenidas"));
        }

        /// <summary>
        /// Obtiene las películas mejor calificadas
        /// </summary>
        [HttpGet("top-rated")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieListResponse>), 200)]
        public async Task<IActionResult> GetTopRatedMovies([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetTopRatedMoviesAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieListResponse>.Error("No se pudieron obtener las películas mejor calificadas"));
            }

            return Ok(ApiResponse<TmdbMovieListResponse>.Ok(result, "Películas mejor calificadas obtenidas"));
        }

        /// <summary>
        /// Obtiene las películas actualmente en cartelera
        /// </summary>
        [HttpGet("now-playing")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieListResponse>), 200)]
        public async Task<IActionResult> GetNowPlayingMovies([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetNowPlayingMoviesAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieListResponse>.Error("No se pudieron obtener las películas en cartelera"));
            }

            return Ok(ApiResponse<TmdbMovieListResponse>.Ok(result, "Películas en cartelera obtenidas"));
        }

        /// <summary>
        /// Obtiene las próximas películas a estrenar
        /// </summary>
        [HttpGet("upcoming")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieListResponse>), 200)]
        public async Task<IActionResult> GetUpcomingMovies([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetUpcomingMoviesAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieListResponse>.Error("No se pudieron obtener las próximas películas"));
            }

            return Ok(ApiResponse<TmdbMovieListResponse>.Ok(result, "Próximas películas obtenidas"));
        }

        /// <summary>
        /// Busca películas por nombre
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieListResponse>), 200)]
        public async Task<IActionResult> SearchMovies([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<TmdbMovieListResponse>.Error("El parámetro de búsqueda es requerido"));
            }

            var result = await _tmdbService.SearchMoviesAsync(query, page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieListResponse>.Error("No se pudieron obtener los resultados de búsqueda"));
            }

            return Ok(ApiResponse<TmdbMovieListResponse>.Ok(result, $"Resultados de búsqueda para: {query}"));
        }

        /// <summary>
        /// Obtiene los detalles completos de una película
        /// </summary>
        [HttpGet("{movieId}")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMovieDetails>), 200)]
        public async Task<IActionResult> GetMovieDetails(int movieId, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetMovieDetailsAsync(movieId, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMovieDetails>.Error($"No se encontró la película con ID: {movieId}"));
            }

            return Ok(ApiResponse<TmdbMovieDetails>.Ok(result, "Detalles de la película obtenidos"));
        }

        /// <summary>
        /// Obtiene los géneros de películas disponibles
        /// </summary>
        [HttpGet("genres")]
        [ProducesResponseType(typeof(ApiResponse<TmdbGenreListResponse>), 200)]
        public async Task<IActionResult> GetMovieGenres([FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetMovieGenresAsync(language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbGenreListResponse>.Error("No se pudieron obtener los géneros"));
            }

            return Ok(ApiResponse<TmdbGenreListResponse>.Ok(result, "Géneros de películas obtenidos"));
        }
    }
}
