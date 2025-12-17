using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("Usuarios")]
    public class Usuario
    {
        [Key]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("usuario_nombre")]
        public string UsuarioNombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("usuario_contrasena_hash")]
        public string UsuarioContrasenaHash { get; set; } = string.Empty;

        [Required]
        [Column("usuario_edad")]
        public int UsuarioEdad { get; set; }

        [Column("usuario_fecha_registro")]
        public DateTime UsuarioFechaRegistro { get; set; } = DateTime.Now;

        [Column("usuario_activo")]
        public bool UsuarioActivo { get; set; } = true;

        // Navegación
        public virtual ICollection<Visualizacion> Visualizaciones { get; set; } = new List<Visualizacion>();
    }
}
