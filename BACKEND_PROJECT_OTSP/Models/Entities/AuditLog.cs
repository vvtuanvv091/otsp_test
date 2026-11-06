using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BACKEND_PROJECT_OTSP.Models
{
    // Nh?t ký thao tác d? truy v?t (dang nh?p, d?i quy?n, duy?t h? so...)
    public class AuditLog
    {
        // Khóa chính, t? tang
        [Key]
        public int Id { get; set; }

        // Tên hành d?ng, ví d?: Login, ApproveTutor
        [Required]
        public string Action { get; set; } = "";

        // Th?i di?m thao tác (UTC)
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Ð?a ch? IP th?c hi?n thao tác (IPv6 t?i da 45 ký t?)
        [MaxLength(45)]
        public string? IpAddress { get; set; }

        // Khóa ngo?i t?i tài kho?n th?c hi?n thao tác
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = "";
        public ApplicationUser User { get; set; } = null!;
    }
}
