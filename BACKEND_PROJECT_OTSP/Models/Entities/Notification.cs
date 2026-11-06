using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Thông báo g?i d?n ngu?i dùng (k?t qu? duy?t h? so, l?ch h?c, thanh toán...)
    public class Notification
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Tiêu d? thông báo
        [Required, MaxLength(200)]
        public string Title { get; set; } = "";

        // N?i dung thông báo
        [Required]
        public string Content { get; set; } = "";

        // Th?i di?m t?o (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Ðã d?c hay chua
        public bool IsRead { get; set; } = false;

        // Khóa ngo?i t?i ngu?i nh?n thông báo
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = "";
        public ApplicationUser User { get; set; } = null!;
    }
}
