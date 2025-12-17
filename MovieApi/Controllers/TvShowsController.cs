using Microsoft.AspNetCore.Mvc;
using MovieApi.DTOs;
using MovieApi.DTOs.TMDB;
using MovieApi.Services;

namespace MovieApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvShowsController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;
        private readonly ILogger<TvShowsController> _logger;

        public TvShowsController(ITmdbService tmdbService, ILogger<TvShowsController> logger)
        {
            _tmdbService = tmdbService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene las series populares del momento
        /// </summary>
        [HttpGet("popular")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTvListResponse>), 200)]
        public async Task<IActionResult> GetPopularTvShows([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetPopularTvShowsAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTvListResponse>.Error("No se pudieron obtener las series populares"));
            }

            return Ok(ApiResponse<TmdbTvListResponse>.Ok(result, "Series populares obtenidas"));
        }

        /// <summary>
        /// Obtiene las series mejor calificadas
        /// </summary>
        [HttpGet("top-rated")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTvListResponse>), 200)]
        public async Task<IActionResult> GetTopRatedTvShows([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetTopRatedTvShowsAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTvListResponse>.Error("No se pudieron obtener las series mejor calificadas"));
            }

            return Ok(ApiResponse<TmdbTvListResponse>.Ok(result, "Series mejor calificadas obtenidas"));
        }

        /// <summary>
        /// Obtiene las series actualmente en emisión
        /// </summary>
        [HttpGet("on-the-air")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTvListResponse>), 200)]
        public async Task<IActionResult> GetOnTheAirTvShows([FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetOnTheAirTvShowsAsync(page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTvListResponse>.Error("No se pudieron obtener las series en emisión"));
            }

            return Ok(ApiResponse<TmdbTvListResponse>.Ok(result, "Series en emisión obtenidas"));
        }

        /// <summary>
        /// Busca series por nombre
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTvListResponse>), 200)]
        public async Task<IActionResult> SearchTvShows([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<TmdbTvListResponse>.Error("El parámetro de búsqueda es requerido"));
            }

            var result = await _tmdbService.SearchTvShowsAsync(query, page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTvListResponse>.Error("No se pudieron obtener los resultados de búsqueda"));
            }

            return Ok(ApiResponse<TmdbTvListResponse>.Ok(result, $"Resultados de búsqueda para: {query}"));
        }

        /// <summary>
        /// Obtiene los detalles completos de una serie
        /// </summary>
        [HttpGet("{tvId}")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTvShowDetails>), 200)]
        public async Task<IActionResult> GetTvShowDetails(int tvId, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetTvShowDetailsAsync(tvId, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTvShowDetails>.Error($"No se encontró la serie con ID: {tvId}"));
            }

            return Ok(ApiResponse<TmdbTvShowDetails>.Ok(result, "Detalles de la serie obtenidos"));
        }

        /// <summary>
        /// Obtiene los detalles de una temporada específica
        /// </summary>
        [HttpGet("{tvId}/season/{seasonNumber}")]
        [ProducesResponseType(typeof(ApiResponse<TmdbSeasonDetails>), 200)]
        public async Task<IActionResult> GetSeasonDetails(int tvId, int seasonNumber, [FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetSeasonDetailsAsync(tvId, seasonNumber, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbSeasonDetails>.Error($"No se encontró la temporada {seasonNumber} de la serie {tvId}"));
            }

            return Ok(ApiResponse<TmdbSeasonDetails>.Ok(result, $"Detalles de la temporada {seasonNumber} obtenidos"));
        }

        /// <summary>
        /// Obtiene los géneros de series disponibles
        /// </summary>
        [HttpGet("genres")]
        [ProducesResponseType(typeof(ApiResponse<TmdbGenreListResponse>), 200)]
        public async Task<IActionResult> GetTvGenres([FromQuery] string language = "es-ES")
        {
            var result = await _tmdbService.GetTvGenresAsync(language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbGenreListResponse>.Error("No se pudieron obtener los géneros"));
            }

            return Ok(ApiResponse<TmdbGenreListResponse>.Ok(result, "Géneros de series obtenidos"));
        }
    }
}
