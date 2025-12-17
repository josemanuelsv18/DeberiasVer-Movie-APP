using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("TiposContenido")]
    public class TipoContenido
    {
        [Key]
        [Column("tipo_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int TipoId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("tipo_nombre")]
        public string TipoNombre { get; set; } = string.Empty;

        // Navegación
        public virtual ICollection<ContenidoTMDB> Contenidos { get; set; } = new List<ContenidoTMDB>();
        public virtual ICollection<Visualizacion> Visualizaciones { get; set; } = new List<Visualizacion>();
    }
}
