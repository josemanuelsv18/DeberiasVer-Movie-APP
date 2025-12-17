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
    public class ResenasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ResenasController> _logger;

        public ResenasController(ApplicationDbContext context, ILogger<ResenasController> logger)
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
        /// Agrega o actualiza una reseña a una visualización
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ResenaInfo>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> AgregarResena([FromBody] ResenaRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            // Verificar que la visualización existe y pertenece al usuario
            var visualizacion = await _context.Visualizaciones
                .FirstOrDefaultAsync(v => v.VisualizacionId == request.VisualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<ResenaInfo>.Error("Visualización no encontrada"));
            }

            // Buscar reseña existente
            var resena = await _context.Resenas
                .FirstOrDefaultAsync(r => r.VisualizacionId == request.VisualizacionId);

            if (resena != null)
            {
                // Actualizar
                resena.ResenaTexto = request.Texto;
                resena.ContieneSpoilers = request.ContieneSpoilers;
                resena.FechaActualizacion = DateTime.Now;
            }
            else
            {
                // Crear nueva
                resena = new Resena
                {
                    VisualizacionId = request.VisualizacionId,
                    ResenaTexto = request.Texto,
                    ContieneSpoilers = request.ContieneSpoilers,
                    FechaResena = DateTime.Now,
                    FechaActualizacion = DateTime.Now
                };
                _context.Resenas.Add(resena);
            }

            await _context.SaveChangesAsync();

            var response = new ResenaInfo
            {
                ResenaId = resena.ResenaId,
                Texto = resena.ResenaTexto ?? "",
                ContieneSpoilers = resena.ContieneSpoilers,
                FechaResena = resena.FechaResena
            };

            return Ok(ApiResponse<ResenaInfo>.Ok(response, "Reseña guardada exitosamente"));
        }

        /// <summary>
        /// Obtiene la reseña de una visualización del usuario
        /// </summary>
        [HttpGet("{visualizacionId}")]
        [ProducesResponseType(typeof(ApiResponse<ResenaInfo>), 200)]
        public async Task<IActionResult> ObtenerResena(int visualizacionId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .Include(v => v.Resena)
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<ResenaInfo>.Error("Visualización no encontrada"));
            }

            if (visualizacion.Resena == null)
            {
                return NotFound(ApiResponse<ResenaInfo>.Error("No hay reseña para esta visualización"));
            }

            var response = new ResenaInfo
            {
                ResenaId = visualizacion.Resena.ResenaId,
                Texto = visualizacion.Resena.ResenaTexto ?? "",
                ContieneSpoilers = visualizacion.Resena.ContieneSpoilers,
                FechaResena = visualizacion.Resena.FechaResena
            };

            return Ok(ApiResponse<ResenaInfo>.Ok(response, "Reseña obtenida"));
        }

        /// <summary>
        /// Elimina una reseña
        /// </summary>
        [HttpDelete("{visualizacionId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        public async Task<IActionResult> EliminarResena(int visualizacionId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .Include(v => v.Resena)
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null || visualizacion.Resena == null)
            {
                return NotFound(ApiResponse<bool>.Error("Reseña no encontrada"));
            }

            _context.Resenas.Remove(visualizacion.Resena);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Reseña eliminada exitosamente"));
        }

        /// <summary>
        /// Obtiene todas las reseñas públicas de un contenido
        /// </summary>
        [HttpGet("contenido/{contenidoId}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<List<ResenaPublicaResponse>>), 200)]
        public async Task<IActionResult> ObtenerResenasContenido(int contenidoId, [FromQuery] bool ocultarSpoilers = true)
        {
            var resenas = await _context.Resenas
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Usuario)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Contenido)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.TipoContenido)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Calificacion)
                .Where(r => r.Visualizacion != null && r.Visualizacion.ContenidoId == contenidoId)
                .OrderByDescending(r => r.FechaResena)
                .Select(r => new ResenaPublicaResponse
                {
                    ResenaId = r.ResenaId,
                    NombreUsuario = r.Visualizacion!.Usuario!.UsuarioNombre,
                    ContenidoId = r.Visualizacion.ContenidoId,
                    TituloContenido = r.Visualizacion.Contenido != null ? r.Visualizacion.Contenido.ContenidoTitulo : null,
                    TipoContenido = r.Visualizacion.TipoContenido != null ? r.Visualizacion.TipoContenido.TipoNombre : "",
                    Texto = ocultarSpoilers && r.ContieneSpoilers 
                        ? "[Esta reseña contiene spoilers]" 
                        : (r.ResenaTexto ?? ""),
                    ContieneSpoilers = r.ContieneSpoilers,
                    Puntuacion = r.Visualizacion.Calificacion != null ? r.Visualizacion.Calificacion.Puntuacion : null,
                    FechaResena = r.FechaResena
                })
                .ToListAsync();

            return Ok(ApiResponse<List<ResenaPublicaResponse>>.Ok(resenas, $"{resenas.Count} reseñas encontradas"));
        }

        /// <summary>
        /// Obtiene las reseñas más recientes (públicas)
        /// </summary>
        [HttpGet("recientes")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<List<ResenaPublicaResponse>>), 200)]
        public async Task<IActionResult> ObtenerResenasRecientes([FromQuery] int cantidad = 10, [FromQuery] bool ocultarSpoilers = true)
        {
            var resenas = await _context.Resenas
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Usuario)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Contenido)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.TipoContenido)
                .Include(r => r.Visualizacion)
                    .ThenInclude(v => v!.Calificacion)
                .OrderByDescending(r => r.FechaResena)
                .Take(cantidad)
                .Select(r => new ResenaPublicaResponse
                {
                    ResenaId = r.ResenaId,
                    NombreUsuario = r.Visualizacion!.Usuario!.UsuarioNombre,
                    ContenidoId = r.Visualizacion.ContenidoId,
                    TituloContenido = r.Visualizacion.Contenido != null ? r.Visualizacion.Contenido.ContenidoTitulo : null,
                    TipoContenido = r.Visualizacion.TipoContenido != null ? r.Visualizacion.TipoContenido.TipoNombre : "",
                    Texto = ocultarSpoilers && r.ContieneSpoilers 
                        ? "[Esta reseña contiene spoilers]" 
                        : (r.ResenaTexto ?? ""),
                    ContieneSpoilers = r.ContieneSpoilers,
                    Puntuacion = r.Visualizacion.Calificacion != null ? r.Visualizacion.Calificacion.Puntuacion : null,
                    FechaResena = r.FechaResena
                })
                .ToListAsync();

            return Ok(ApiResponse<List<ResenaPublicaResponse>>.Ok(resenas, "Reseñas recientes obtenidas"));
        }
    }
}
