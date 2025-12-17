using System.ComponentModel.DataAnnotations;

namespace MovieApi.DTOs
{
    // ========== Auth DTOs ==========
    public class RegisterRequest
    {
        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres")]
        [MaxLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Contrasena { get; set; } = string.Empty;

        [Required(ErrorMessage = "La edad es requerida")]
        [Range(0, 120, ErrorMessage = "La edad debe estar entre 0 y 120")]
        public int Edad { get; set; }
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Contrasena { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public UserInfo? Usuario { get; set; }
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public int Edad { get; set; }
        public DateTime FechaRegistro { get; set; }
    }

    // ========== Visualización DTOs ==========
    public class RegistrarVisualizacionRequest
    {
        [Required]
        public int ContenidoId { get; set; }
        
        [Required]
        [Range(1, 2, ErrorMessage = "TipoId debe ser 1 (Película) o 2 (Serie)")]
        public int TipoId { get; set; }
        
        public string? Titulo { get; set; }
    }

    public class VisualizacionResponse
    {
        public int VisualizacionId { get; set; }
        public int ContenidoId { get; set; }
        public string? Titulo { get; set; }
        public string TipoContenido { get; set; } = string.Empty;
        public DateTime FechaVisualizacion { get; set; }
        public CalificacionInfo? Calificacion { get; set; }
        public ResenaInfo? Resena { get; set; }
        public List<EpisodioVistoInfo> EpisodiosVistos { get; set; } = new();
    }

    // ========== Calificación DTOs ==========
    public class CalificacionRequest
    {
        [Required]
        public int VisualizacionId { get; set; }

        [Required]
        [Range(1, 10, ErrorMessage = "La puntuación debe estar entre 1 y 10")]
        public decimal Puntuacion { get; set; }
    }

    public class CalificacionInfo
    {
        public int CalificacionId { get; set; }
        public decimal Puntuacion { get; set; }
        public DateTime FechaCalificacion { get; set; }
    }

    // ========== Reseña DTOs ==========
    public class ResenaRequest
    {
        [Required]
        public int VisualizacionId { get; set; }

        [Required(ErrorMessage = "El texto de la reseña es requerido")]
        public string Texto { get; set; } = string.Empty;

        public bool ContieneSpoilers { get; set; } = false;
    }

    public class ResenaInfo
    {
        public int ResenaId { get; set; }
        public string Texto { get; set; } = string.Empty;
        public bool ContieneSpoilers { get; set; }
        public DateTime FechaResena { get; set; }
    }

    public class ResenaPublicaResponse
    {
        public int ResenaId { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public int ContenidoId { get; set; }
        public string? TituloContenido { get; set; }
        public string TipoContenido { get; set; } = string.Empty;
        public string Texto { get; set; } = string.Empty;
        public bool ContieneSpoilers { get; set; }
        public decimal? Puntuacion { get; set; }
        public DateTime FechaResena { get; set; }
    }

    // ========== Episodio Visto DTOs ==========
    public class EpisodioVistoRequest
    {
        [Required]
        public int VisualizacionId { get; set; }

        [Required]
        public int TemporadaId { get; set; }

        [Required]
        public int EpisodioId { get; set; }
    }

    public class EpisodioVistoInfo
    {
        public int Id { get; set; }
        public int TemporadaId { get; set; }
        public int EpisodioId { get; set; }
        public DateTime FechaVisto { get; set; }
    }

    // ========== Estadísticas DTOs ==========
    public class EstadisticasUsuarioResponse
    {
        public int TotalContenidosVistos { get; set; }
        public int TotalPeliculas { get; set; }
        public int TotalSeries { get; set; }
        public decimal? PromedioCalificacion { get; set; }
        public int TotalResenas { get; set; }
        public int TotalEpisodiosVistos { get; set; }
    }

    // ========== API Response Wrapper ==========
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Operación exitosa")
        {
            return new ApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static ApiResponse<T> Error(string message)
        {
            return new ApiResponse<T> { Success = false, Message = message };
        }
    }
}
