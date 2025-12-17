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
    public class VisualizacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VisualizacionesController> _logger;

        public VisualizacionesController(ApplicationDbContext context, ILogger<VisualizacionesController> logger)
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
        /// Registra una nueva visualización de contenido
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<VisualizacionResponse>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegistrarVisualizacion([FromBody] RegistrarVisualizacionRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            try
            {
                // Verificar si ya existe la visualización
                var existente = await _context.Visualizaciones
                    .FirstOrDefaultAsync(v => v.UsuarioId == userId && v.ContenidoId == request.ContenidoId);

                if (existente != null)
                {
                    return BadRequest(ApiResponse<VisualizacionResponse>.Error("Ya has registrado este contenido"));
                }

                // Verificar/crear referencia al contenido de TMDB
                var contenido = await _context.ContenidosTMDB.FindAsync(request.ContenidoId);
                if (contenido == null)
                {
                    contenido = new ContenidoTMDB
                    {
                        ContenidoId = request.ContenidoId,
                        TipoId = request.TipoId,
                        ContenidoTitulo = request.Titulo,
                        ContenidoFechaSincronizacion = DateTime.Now
                    };
                    _context.ContenidosTMDB.Add(contenido);
                    await _context.SaveChangesAsync();
                }

                // Crear visualización
                var visualizacion = new Visualizacion
                {
                    UsuarioId = userId,
                    ContenidoId = request.ContenidoId,
                    TipoId = request.TipoId,
                    FechaVisualizacion = DateTime.Now,
                    FechaActualizacion = DateTime.Now
                };

                _context.Visualizaciones.Add(visualizacion);
                await _context.SaveChangesAsync();

                var response = new VisualizacionResponse
                {
                    VisualizacionId = visualizacion.VisualizacionId,
                    ContenidoId = visualizacion.ContenidoId,
                    Titulo = contenido.ContenidoTitulo,
                    TipoContenido = request.TipoId == 1 ? "Película" : "Serie",
                    FechaVisualizacion = visualizacion.FechaVisualizacion
                };

                return Ok(ApiResponse<VisualizacionResponse>.Ok(response, "Visualización registrada exitosamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar visualización");
                return BadRequest(ApiResponse<VisualizacionResponse>.Error("Error al registrar visualización"));
            }
        }

        /// <summary>
        /// Obtiene todas las visualizaciones del usuario autenticado
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<List<VisualizacionResponse>>), 200)]
        public async Task<IActionResult> ObtenerMisVisualizaciones()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizaciones = await _context.Visualizaciones
                .Include(v => v.Contenido)
                .Include(v => v.TipoContenido)
                .Include(v => v.Calificacion)
                .Include(v => v.Resena)
                .Include(v => v.EpisodiosVistos)
                .Where(v => v.UsuarioId == userId)
                .OrderByDescending(v => v.FechaVisualizacion)
                .Select(v => new VisualizacionResponse
                {
                    VisualizacionId = v.VisualizacionId,
                    ContenidoId = v.ContenidoId,
                    Titulo = v.Contenido != null ? v.Contenido.ContenidoTitulo : null,
                    TipoContenido = v.TipoContenido != null ? v.TipoContenido.TipoNombre : "",
                    FechaVisualizacion = v.FechaVisualizacion,
                    Calificacion = v.Calificacion != null ? new CalificacionInfo
                    {
                        CalificacionId = v.Calificacion.CalificacionId,
                        Puntuacion = v.Calificacion.Puntuacion,
                        FechaCalificacion = v.Calificacion.FechaCalificacion
                    } : null,
                    Resena = v.Resena != null ? new ResenaInfo
                    {
                        ResenaId = v.Resena.ResenaId,
                        Texto = v.Resena.ResenaTexto ?? "",
                        ContieneSpoilers = v.Resena.ContieneSpoilers,
                        FechaResena = v.Resena.FechaResena
                    } : null,
                    EpisodiosVistos = v.EpisodiosVistos.Select(e => new EpisodioVistoInfo
                    {
                        Id = e.EpisodioId,
                        TemporadaId = e.TemporadaTmdbId,
                        EpisodioId = e.EpisodioTmdbId,
                        FechaVisto = e.FechaVisto
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<VisualizacionResponse>>.Ok(visualizaciones, "Visualizaciones obtenidas"));
        }

        /// <summary>
        /// Obtiene una visualización específica por su ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<VisualizacionResponse>), 200)]
        public async Task<IActionResult> ObtenerVisualizacion(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var v = await _context.Visualizaciones
                .Include(v => v.Contenido)
                .Include(v => v.TipoContenido)
                .Include(v => v.Calificacion)
                .Include(v => v.Resena)
                .Include(v => v.EpisodiosVistos)
                .FirstOrDefaultAsync(v => v.VisualizacionId == id && v.UsuarioId == userId);

            if (v == null)
            {
                return NotFound(ApiResponse<VisualizacionResponse>.Error("Visualización no encontrada"));
            }

            var response = new VisualizacionResponse
            {
                VisualizacionId = v.VisualizacionId,
                ContenidoId = v.ContenidoId,
                Titulo = v.Contenido?.ContenidoTitulo,
                TipoContenido = v.TipoContenido?.TipoNombre ?? "",
                FechaVisualizacion = v.FechaVisualizacion,
                Calificacion = v.Calificacion != null ? new CalificacionInfo
                {
                    CalificacionId = v.Calificacion.CalificacionId,
                    Puntuacion = v.Calificacion.Puntuacion,
                    FechaCalificacion = v.Calificacion.FechaCalificacion
                } : null,
                Resena = v.Resena != null ? new ResenaInfo
                {
                    ResenaId = v.Resena.ResenaId,
                    Texto = v.Resena.ResenaTexto ?? "",
                    ContieneSpoilers = v.Resena.ContieneSpoilers,
                    FechaResena = v.Resena.FechaResena
                } : null,
                EpisodiosVistos = v.EpisodiosVistos.Select(e => new EpisodioVistoInfo
                {
                    Id = e.EpisodioId,
                    TemporadaId = e.TemporadaTmdbId,
                    EpisodioId = e.EpisodioTmdbId,
                    FechaVisto = e.FechaVisto
                }).ToList()
            };

            return Ok(ApiResponse<VisualizacionResponse>.Ok(response, "Visualización obtenida"));
        }

        /// <summary>
        /// Elimina una visualización
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        public async Task<IActionResult> EliminarVisualizacion(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .Include(v => v.Calificacion)
                .Include(v => v.Resena)
                .Include(v => v.EpisodiosVistos)
                .FirstOrDefaultAsync(v => v.VisualizacionId == id && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<bool>.Error("Visualización no encontrada"));
            }

            // Eliminar dependencias
            if (visualizacion.Calificacion != null)
                _context.Calificaciones.Remove(visualizacion.Calificacion);
            if (visualizacion.Resena != null)
                _context.Resenas.Remove(visualizacion.Resena);
            _context.EpisodiosVistos.RemoveRange(visualizacion.EpisodiosVistos);
            _context.Visualizaciones.Remove(visualizacion);

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Visualización eliminada exitosamente"));
        }

        /// <summary>
        /// Obtiene las estadísticas del usuario
        /// </summary>
        [HttpGet("estadisticas")]
        [ProducesResponseType(typeof(ApiResponse<EstadisticasUsuarioResponse>), 200)]
        public async Task<IActionResult> ObtenerEstadisticas()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizaciones = await _context.Visualizaciones
                .Include(v => v.Calificacion)
                .Where(v => v.UsuarioId == userId)
                .ToListAsync();

            var episodiosCount = await _context.EpisodiosVistos
                .CountAsync(e => _context.Visualizaciones
                    .Any(v => v.VisualizacionId == e.VisualizacionId && v.UsuarioId == userId));

            var resenasCount = await _context.Resenas
                .CountAsync(r => _context.Visualizaciones
                    .Any(v => v.VisualizacionId == r.VisualizacionId && v.UsuarioId == userId));

            var calificaciones = visualizaciones
                .Where(v => v.Calificacion != null)
                .Select(v => v.Calificacion!.Puntuacion)
                .ToList();

            var estadisticas = new EstadisticasUsuarioResponse
            {
                TotalContenidosVistos = visualizaciones.Count,
                TotalPeliculas = visualizaciones.Count(v => v.TipoId == 1),
                TotalSeries = visualizaciones.Count(v => v.TipoId == 2),
                PromedioCalificacion = calificaciones.Any() ? calificaciones.Average() : null,
                TotalResenas = resenasCount,
                TotalEpisodiosVistos = episodiosCount
            };

            return Ok(ApiResponse<EstadisticasUsuarioResponse>.Ok(estadisticas, "Estadísticas obtenidas"));
        }
    }
}
