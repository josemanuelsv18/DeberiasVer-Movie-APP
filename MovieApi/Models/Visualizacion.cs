using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("Visualizaciones")]
    public class Visualizacion
    {
        [Key]
        [Column("visualizacion_id")]
        public int VisualizacionId { get; set; }

        [Required]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Required]
        [Column("contenido_id")]
        public int ContenidoId { get; set; }

        [Required]
        [Column("tipo_id")]
        public int TipoId { get; set; }

        [Column("fecha_visualizacion")]
        public DateTime FechaVisualizacion { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        [ForeignKey("ContenidoId")]
        public virtual ContenidoTMDB? Contenido { get; set; }

        [ForeignKey("TipoId")]
        public virtual TipoContenido? TipoContenido { get; set; }

        public virtual Calificacion? Calificacion { get; set; }
        public virtual Resena? Resena { get; set; }
        public virtual ICollection<EpisodioVisto> EpisodiosVistos { get; set; } = new List<EpisodioVisto>();
    }
}
