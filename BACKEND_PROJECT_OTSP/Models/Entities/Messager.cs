using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    public class Messager
    {
        // Kh�a ch�nh
        [Key]
        public int Id { get; set; }

        // N?i dung tin nh?n
        [Required]
        public string Content { get; set; } = "";

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? EditedAt { get; set; }

        // Th?i di?m g?i (UTC)
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // �� d?c hay chua
        public bool IsRead { get; set; } = false;

        // Ngu?i g?i
        [Required]
        [ForeignKey("Sender")]
        public string SenderId { get; set; } = "";
        public ApplicationUser Sender { get; set; } = null!;

        // Ngu?i nh?n
        [Required]
        [ForeignKey("Receiver")]
        public string ReceiverId { get; set; } = "";
        public ApplicationUser Receiver { get; set; } = null!;

    }
}
