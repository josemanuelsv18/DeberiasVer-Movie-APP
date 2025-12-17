using Microsoft.AspNetCore.Mvc;
using MovieApi.DTOs;
using MovieApi.DTOs.TMDB;
using MovieApi.Services;

namespace MovieApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ITmdbService tmdbService, ILogger<SearchController> logger)
        {
            _tmdbService = tmdbService;
            _logger = logger;
        }

        /// <summary>
        /// Busca películas y series simultáneamente
        /// </summary>
        [HttpGet("multi")]
        [ProducesResponseType(typeof(ApiResponse<TmdbMultiSearchResponse>), 200)]
        public async Task<IActionResult> MultiSearch([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] string language = "es-ES")
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<TmdbMultiSearchResponse>.Error("El parámetro de búsqueda es requerido"));
            }

            var result = await _tmdbService.MultiSearchAsync(query, page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbMultiSearchResponse>.Error("No se pudieron obtener los resultados de búsqueda"));
            }

            return Ok(ApiResponse<TmdbMultiSearchResponse>.Ok(result, $"Resultados de búsqueda para: {query}"));
        }

        /// <summary>
        /// Obtiene contenido en tendencia
        /// </summary>
        /// <param name="mediaType">Tipo de contenido: all, movie, tv</param>
        /// <param name="timeWindow">Ventana de tiempo: day, week</param>
        [HttpGet("trending")]
        [ProducesResponseType(typeof(ApiResponse<TmdbTrendingResponse>), 200)]
        public async Task<IActionResult> GetTrending(
            [FromQuery] string mediaType = "all", 
            [FromQuery] string timeWindow = "week", 
            [FromQuery] int page = 1, 
            [FromQuery] string language = "es-ES")
        {
            var validMediaTypes = new[] { "all", "movie", "tv" };
            var validTimeWindows = new[] { "day", "week" };

            if (!validMediaTypes.Contains(mediaType.ToLower()))
            {
                return BadRequest(ApiResponse<TmdbTrendingResponse>.Error("mediaType debe ser: all, movie, o tv"));
            }

            if (!validTimeWindows.Contains(timeWindow.ToLower()))
            {
                return BadRequest(ApiResponse<TmdbTrendingResponse>.Error("timeWindow debe ser: day o week"));
            }

            var result = await _tmdbService.GetTrendingAsync(mediaType, timeWindow, page, language);
            
            if (result == null)
            {
                return NotFound(ApiResponse<TmdbTrendingResponse>.Error("No se pudieron obtener las tendencias"));
            }

            return Ok(ApiResponse<TmdbTrendingResponse>.Ok(result, $"Tendencias ({mediaType} - {timeWindow}) obtenidas"));
        }
    }
}
