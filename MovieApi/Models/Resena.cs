using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("Reseñas")]
    public class Resena
    {
        [Key]
        [Column("reseña_id")]
        public int ResenaId { get; set; }

        [Required]
        [Column("visualizacion_id")]
        public int VisualizacionId { get; set; }

        [Column("reseña_texto")]
        public string? ResenaTexto { get; set; }

        [Column("contiene_spoilers")]
        public bool ContieneSpoilers { get; set; } = false;

        [Column("fecha_reseña")]
        public DateTime FechaResena { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("VisualizacionId")]
        public virtual Visualizacion? Visualizacion { get; set; }
    }
}
