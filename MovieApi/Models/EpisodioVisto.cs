using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("EpisodiosVistos")]
    public class EpisodioVisto
    {
        [Key]
        [Column("episodio_id")]
        public int EpisodioId { get; set; }

        [Required]
        [Column("visualizacion_id")]
        public int VisualizacionId { get; set; }

        [Required]
        [Column("temporada_tmdb_id")]
        public int TemporadaTmdbId { get; set; }

        [Required]
        [Column("episodio_tmdb_id")]
        public int EpisodioTmdbId { get; set; }

        [Column("fecha_visto")]
        public DateTime FechaVisto { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("VisualizacionId")]
        public virtual Visualizacion? Visualizacion { get; set; }
    }
}
