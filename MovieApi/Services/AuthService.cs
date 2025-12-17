using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MovieApi.Data;
using MovieApi.DTOs;
using MovieApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MovieApi.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserInfo?> GetUserByIdAsync(int userId);
        Task<bool> UserExistsAsync(string nombreUsuario);
        string GenerateJwtToken(Usuario usuario);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Verificar si el usuario ya existe
                if (await UserExistsAsync(request.NombreUsuario))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "El nombre de usuario ya está en uso"
                    };
                }

                // Crear hash de la contraseña
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Contrasena);

                // Crear nuevo usuario
                var usuario = new Usuario
                {
                    UsuarioNombre = request.NombreUsuario,
                    UsuarioContrasenaHash = passwordHash,
                    UsuarioEdad = request.Edad,
                    UsuarioFechaRegistro = DateTime.Now,
                    UsuarioActivo = true
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                // Generar token
                var token = GenerateJwtToken(usuario);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Usuario registrado exitosamente",
                    Token = token,
                    Usuario = new UserInfo
                    {
                        Id = usuario.UsuarioId,
                        NombreUsuario = usuario.UsuarioNombre,
                        Edad = usuario.UsuarioEdad,
                        FechaRegistro = usuario.UsuarioFechaRegistro
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar usuario");
                return new AuthResponse
                {
                    Success = false,
                    Message = "Error al registrar usuario: " + ex.Message
                };
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                // Buscar usuario
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.UsuarioNombre == request.NombreUsuario && u.UsuarioActivo);

                if (usuario == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Usuario no encontrado o inactivo"
                    };
                }

                // Verificar contraseña
                if (!BCrypt.Net.BCrypt.Verify(request.Contrasena, usuario.UsuarioContrasenaHash))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Contraseña incorrecta"
                    };
                }

                // Generar token
                var token = GenerateJwtToken(usuario);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Inicio de sesión exitoso",
                    Token = token,
                    Usuario = new UserInfo
                    {
                        Id = usuario.UsuarioId,
                        NombreUsuario = usuario.UsuarioNombre,
                        Edad = usuario.UsuarioEdad,
                        FechaRegistro = usuario.UsuarioFechaRegistro
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al iniciar sesión");
                return new AuthResponse
                {
                    Success = false,
                    Message = "Error al iniciar sesión: " + ex.Message
                };
            }
        }

        public async Task<UserInfo?> GetUserByIdAsync(int userId)
        {
            var usuario = await _context.Usuarios.FindAsync(userId);
            
            if (usuario == null)
                return null;

            return new UserInfo
            {
                Id = usuario.UsuarioId,
                NombreUsuario = usuario.UsuarioNombre,
                Edad = usuario.UsuarioEdad,
                FechaRegistro = usuario.UsuarioFechaRegistro
            };
        }

        public async Task<bool> UserExistsAsync(string nombreUsuario)
        {
            return await _context.Usuarios.AnyAsync(u => u.UsuarioNombre == nombreUsuario);
        }

        public string GenerateJwtToken(Usuario usuario)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "MovieApi";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "MovieApiUsers";
            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "1440");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.UsuarioId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, usuario.UsuarioNombre),
                new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()),
                new Claim(ClaimTypes.Name, usuario.UsuarioNombre),
                new Claim("edad", usuario.UsuarioEdad.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
