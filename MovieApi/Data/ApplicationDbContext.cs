using Microsoft.EntityFrameworkCore;
using MovieApi.Models;

namespace MovieApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<TipoContenido> TiposContenido { get; set; }
        public DbSet<ContenidoTMDB> ContenidosTMDB { get; set; }
        public DbSet<Visualizacion> Visualizaciones { get; set; }
        public DbSet<Calificacion> Calificaciones { get; set; }
        public DbSet<Resena> Resenas { get; set; }
        public DbSet<EpisodioVisto> EpisodiosVistos { get; set; }
        public DbSet<EstadoVisualizacion> EstadosVisualizacion { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasIndex(e => e.UsuarioNombre).IsUnique();
                entity.Property(e => e.UsuarioFechaRegistro).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UsuarioActivo).HasDefaultValue(true);
            });

            // Configuración de ContenidoTMDB
            modelBuilder.Entity<ContenidoTMDB>(entity =>
            {
                entity.Property(e => e.ContenidoFechaSincronizacion).HasDefaultValueSql("GETDATE()");
            });

            // Configuración de Visualización
            modelBuilder.Entity<Visualizacion>(entity =>
            {
                entity.HasIndex(e => new { e.UsuarioId, e.ContenidoId }).IsUnique();
                entity.Property(e => e.FechaVisualizacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.FechaActualizacion).HasDefaultValueSql("GETDATE()");
            });

            // Configuración de Calificación
            modelBuilder.Entity<Calificacion>(entity =>
            {
                entity.Property(e => e.Puntuacion).HasColumnType("decimal(3,1)");
                entity.Property(e => e.FechaCalificacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.FechaActualizacion).HasDefaultValueSql("GETDATE()");
            });

            // Configuración de Reseña
            modelBuilder.Entity<Resena>(entity =>
            {
                entity.Property(e => e.ContieneSpoilers).HasDefaultValue(false);
                entity.Property(e => e.FechaResena).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.FechaActualizacion).HasDefaultValueSql("GETDATE()");
            });

            // Configuración de EpisodioVisto
            modelBuilder.Entity<EpisodioVisto>(entity =>
            {
                entity.HasIndex(e => new { e.VisualizacionId, e.TemporadaTmdbId, e.EpisodioTmdbId }).IsUnique();
                entity.Property(e => e.FechaVisto).HasDefaultValueSql("GETDATE()");
            });
        }
    }
}
