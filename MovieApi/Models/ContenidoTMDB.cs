using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("ContenidosTMDB")]
    public class ContenidoTMDB
    {
        [Key]
        [Column("contenido_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ContenidoId { get; set; }

        [Required]
        [Column("tipo_id")]
        public int TipoId { get; set; }

        [MaxLength(255)]
        [Column("contenido_titulo")]
        public string? ContenidoTitulo { get; set; }

        [Column("contenido_fecha_sincronizacion")]
        public DateTime ContenidoFechaSincronizacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("TipoId")]
        public virtual TipoContenido? TipoContenido { get; set; }

        public virtual ICollection<Visualizacion> Visualizaciones { get; set; } = new List<Visualizacion>();
    }
}
