using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApi.Data;
using MovieApi.DTOs;
using MovieApi.Models;
using System.Security.Claims;

namespace MovieApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EpisodiosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EpisodiosController> _logger;

        public EpisodiosController(ApplicationDbContext context, ILogger<EpisodiosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        /// <summary>
        /// Marca un episodio como visto
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<EpisodioVistoInfo>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> MarcarEpisodioVisto([FromBody] EpisodioVistoRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            // Verificar que la visualización existe y pertenece al usuario
            var visualizacion = await _context.Visualizaciones
                .FirstOrDefaultAsync(v => v.VisualizacionId == request.VisualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<EpisodioVistoInfo>.Error("Visualización no encontrada"));
            }

            // Verificar que es una serie
            if (visualizacion.TipoId != 2)
            {
                return BadRequest(ApiResponse<EpisodioVistoInfo>.Error("Solo puedes marcar episodios de series"));
            }

            // Verificar si ya existe
            var existe = await _context.EpisodiosVistos
                .AnyAsync(e => e.VisualizacionId == request.VisualizacionId 
                    && e.TemporadaTmdbId == request.TemporadaId 
                    && e.EpisodioTmdbId == request.EpisodioId);

            if (existe)
            {
                return BadRequest(ApiResponse<EpisodioVistoInfo>.Error("Este episodio ya está marcado como visto"));
            }

            var episodio = new EpisodioVisto
            {
                VisualizacionId = request.VisualizacionId,
                TemporadaTmdbId = request.TemporadaId,
                EpisodioTmdbId = request.EpisodioId,
                FechaVisto = DateTime.Now
            };

            _context.EpisodiosVistos.Add(episodio);
            await _context.SaveChangesAsync();

            var response = new EpisodioVistoInfo
            {
                Id = episodio.EpisodioId,
                TemporadaId = episodio.TemporadaTmdbId,
                EpisodioId = episodio.EpisodioTmdbId,
                FechaVisto = episodio.FechaVisto
            };

            return Ok(ApiResponse<EpisodioVistoInfo>.Ok(response, "Episodio marcado como visto"));
        }

        /// <summary>
        /// Marca múltiples episodios como vistos
        /// </summary>
        [HttpPost("bulk")]
        [ProducesResponseType(typeof(ApiResponse<List<EpisodioVistoInfo>>), 200)]
        public async Task<IActionResult> MarcarEpisodiosVistos([FromBody] List<EpisodioVistoRequest> requests)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var episodiosAgregados = new List<EpisodioVistoInfo>();

            foreach (var request in requests)
            {
                var visualizacion = await _context.Visualizaciones
                    .FirstOrDefaultAsync(v => v.VisualizacionId == request.VisualizacionId && v.UsuarioId == userId);

                if (visualizacion == null || visualizacion.TipoId != 2) continue;

                var existe = await _context.EpisodiosVistos
                    .AnyAsync(e => e.VisualizacionId == request.VisualizacionId 
                        && e.TemporadaTmdbId == request.TemporadaId 
                        && e.EpisodioTmdbId == request.EpisodioId);

                if (existe) continue;

                var episodio = new EpisodioVisto
                {
                    VisualizacionId = request.VisualizacionId,
                    TemporadaTmdbId = request.TemporadaId,
                    EpisodioTmdbId = request.EpisodioId,
                    FechaVisto = DateTime.Now
                };

                _context.EpisodiosVistos.Add(episodio);
                await _context.SaveChangesAsync();

                episodiosAgregados.Add(new EpisodioVistoInfo
                {
                    Id = episodio.EpisodioId,
                    TemporadaId = episodio.TemporadaTmdbId,
                    EpisodioId = episodio.EpisodioTmdbId,
                    FechaVisto = episodio.FechaVisto
                });
            }

            return Ok(ApiResponse<List<EpisodioVistoInfo>>.Ok(episodiosAgregados, $"{episodiosAgregados.Count} episodios marcados como vistos"));
        }

        /// <summary>
        /// Obtiene los episodios vistos de una visualización
        /// </summary>
        [HttpGet("visualizacion/{visualizacionId}")]
        [ProducesResponseType(typeof(ApiResponse<List<EpisodioVistoInfo>>), 200)]
        public async Task<IActionResult> ObtenerEpisodiosVistos(int visualizacionId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<List<EpisodioVistoInfo>>.Error("Visualización no encontrada"));
            }

            var episodios = await _context.EpisodiosVistos
                .Where(e => e.VisualizacionId == visualizacionId)
                .OrderBy(e => e.TemporadaTmdbId)
                .ThenBy(e => e.EpisodioTmdbId)
                .Select(e => new EpisodioVistoInfo
                {
                    Id = e.EpisodioId,
                    TemporadaId = e.TemporadaTmdbId,
                    EpisodioId = e.EpisodioTmdbId,
                    FechaVisto = e.FechaVisto
                })
                .ToListAsync();

            return Ok(ApiResponse<List<EpisodioVistoInfo>>.Ok(episodios, $"{episodios.Count} episodios vistos"));
        }

        /// <summary>
        /// Desmarca un episodio como visto
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        public async Task<IActionResult> DesmarcarEpisodio(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var episodio = await _context.EpisodiosVistos
                .Include(e => e.Visualizacion)
                .FirstOrDefaultAsync(e => e.EpisodioId == id && e.Visualizacion!.UsuarioId == userId);

            if (episodio == null)
            {
                return NotFound(ApiResponse<bool>.Error("Episodio no encontrado"));
            }

            _context.EpisodiosVistos.Remove(episodio);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Episodio desmarcado"));
        }

        /// <summary>
        /// Desmarca un episodio por sus IDs de TMDB
        /// </summary>
        [HttpDelete("visualizacion/{visualizacionId}/temporada/{temporadaId}/episodio/{episodioId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        public async Task<IActionResult> DesmarcarEpisodio(int visualizacionId, int temporadaId, int episodioId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<bool>.Error("Visualización no encontrada"));
            }

            var episodio = await _context.EpisodiosVistos
                .FirstOrDefaultAsync(e => e.VisualizacionId == visualizacionId 
                    && e.TemporadaTmdbId == temporadaId 
                    && e.EpisodioTmdbId == episodioId);

            if (episodio == null)
            {
                return NotFound(ApiResponse<bool>.Error("Episodio no encontrado"));
            }

            _context.EpisodiosVistos.Remove(episodio);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Episodio desmarcado"));
        }
    }
}
