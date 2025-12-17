using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieApi.Models
{
    [Table("EstadosVisualizacion")]
    public class EstadoVisualizacion
    {
        [Key]
        [Column("estado_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int EstadoId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("estado_nombre")]
        public string EstadoNombre { get; set; } = string.Empty;
    }
}
