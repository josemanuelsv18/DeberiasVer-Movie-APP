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
    public class CalificacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CalificacionesController> _logger;

        public CalificacionesController(ApplicationDbContext context, ILogger<CalificacionesController> logger)
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
        /// Agrega o actualiza una calificación a una visualización
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CalificacionInfo>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> AgregarCalificacion([FromBody] CalificacionRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            // Verificar que la visualización existe y pertenece al usuario
            var visualizacion = await _context.Visualizaciones
                .FirstOrDefaultAsync(v => v.VisualizacionId == request.VisualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<CalificacionInfo>.Error("Visualización no encontrada"));
            }

            // Buscar calificación existente
            var calificacion = await _context.Calificaciones
                .FirstOrDefaultAsync(c => c.VisualizacionId == request.VisualizacionId);

            if (calificacion != null)
            {
                // Actualizar
                calificacion.Puntuacion = request.Puntuacion;
                calificacion.FechaActualizacion = DateTime.Now;
            }
            else
            {
                // Crear nueva
                calificacion = new Calificacion
                {
                    VisualizacionId = request.VisualizacionId,
                    Puntuacion = request.Puntuacion,
                    FechaCalificacion = DateTime.Now,
                    FechaActualizacion = DateTime.Now
                };
                _context.Calificaciones.Add(calificacion);
            }

            await _context.SaveChangesAsync();

            var response = new CalificacionInfo
            {
                CalificacionId = calificacion.CalificacionId,
                Puntuacion = calificacion.Puntuacion,
                FechaCalificacion = calificacion.FechaCalificacion
            };

            return Ok(ApiResponse<CalificacionInfo>.Ok(response, "Calificación guardada exitosamente"));
        }

        /// <summary>
        /// Obtiene la calificación de una visualización
        /// </summary>
        [HttpGet("{visualizacionId}")]
        [ProducesResponseType(typeof(ApiResponse<CalificacionInfo>), 200)]
        public async Task<IActionResult> ObtenerCalificacion(int visualizacionId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .Include(v => v.Calificacion)
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null)
            {
                return NotFound(ApiResponse<CalificacionInfo>.Error("Visualización no encontrada"));
            }

            if (visualizacion.Calificacion == null)
            {
                return NotFound(ApiResponse<CalificacionInfo>.Error("No hay calificación para esta visualización"));
            }

            var response = new CalificacionInfo
            {
                CalificacionId = visualizacion.Calificacion.CalificacionId,
                Puntuacion = visualizacion.Calificacion.Puntuacion,
                FechaCalificacion = visualizacion.Calificacion.FechaCalificacion
            };

            return Ok(ApiResponse<CalificacionInfo>.Ok(response, "Calificación obtenida"));
        }

        /// <summary>
        /// Elimina una calificación
        /// </summary>
        [HttpDelete("{visualizacionId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        public async Task<IActionResult> EliminarCalificacion(int visualizacionId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var visualizacion = await _context.Visualizaciones
                .Include(v => v.Calificacion)
                .FirstOrDefaultAsync(v => v.VisualizacionId == visualizacionId && v.UsuarioId == userId);

            if (visualizacion == null || visualizacion.Calificacion == null)
            {
                return NotFound(ApiResponse<bool>.Error("Calificación no encontrada"));
            }

            _context.Calificaciones.Remove(visualizacion.Calificacion);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Calificación eliminada exitosamente"));
        }

        /// <summary>
        /// Obtiene el promedio de calificaciones de un contenido específico (público)
        /// </summary>
        [HttpGet("contenido/{contenidoId}/promedio")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        public async Task<IActionResult> ObtenerPromedioContenido(int contenidoId)
        {
            var calificaciones = await _context.Calificaciones
                .Where(c => _context.Visualizaciones
                    .Any(v => v.VisualizacionId == c.VisualizacionId && v.ContenidoId == contenidoId))
                .ToListAsync();

            if (!calificaciones.Any())
            {
                return Ok(ApiResponse<object>.Ok(new 
                { 
                    contenidoId, 
                    promedio = (decimal?)null, 
                    totalCalificaciones = 0 
                }, "No hay calificaciones para este contenido"));
            }

            var promedio = calificaciones.Average(c => c.Puntuacion);

            return Ok(ApiResponse<object>.Ok(new 
            { 
                contenidoId, 
                promedio = Math.Round(promedio, 1), 
                totalCalificaciones = calificaciones.Count 
            }, "Promedio obtenido"));
        }
    }
}
