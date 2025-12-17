using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("Calificaciones")]
    public class Calificacion
    {
        [Key]
        [Column("calificacion_id")]
        public int CalificacionId { get; set; }

        [Required]
        [Column("visualizacion_id")]
        public int VisualizacionId { get; set; }

        [Required]
        [Column("puntuacion")]
        [Range(1, 10)]
        public decimal Puntuacion { get; set; }

        [Column("fecha_calificacion")]
        public DateTime FechaCalificacion { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("VisualizacionId")]
        public virtual Visualizacion? Visualizacion { get; set; }
    }
}
