using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    public class Complaint
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // N?i dung khi?u n?i
        [Required]
        public string Content { get; set; } = "";

        // Ðu?ng d?n file minh ch?ng
        public string? EvidenceUrl { get; set; }

        // Tr?ng thái x? lý: New, Processing, Resolved, Rejected
        public ComplaintStatus Status { get; set; } = ComplaintStatus.New;

        // K?t qu? gi?i quy?t do admin di?n
        public string? Resolution { get; set; }

        // Th?i di?m g?i khi?u n?i (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Ngu?i g?i khi?u n?i
        [Required]
        [ForeignKey("Sender")]
        public string SenderId { get; set; } = "";
        public ApplicationUser Sender { get; set; } = null!;

        // Ngu?i b? khi?u n?i (có th? không có)
        [ForeignKey("TargetUser")]
        public string? TargetUserId { get; set; }
        public ApplicationUser? TargetUser { get; set; }

        // Admin dã x? lý khi?u n?i
        [ForeignKey("HandledByAdmin")]
        public int? HandledByAdminId { get; set; }
        public AdminProfile? HandledByAdmin { get; set; }

    }
}
