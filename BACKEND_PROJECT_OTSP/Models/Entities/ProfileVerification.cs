using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // M?t l?n admin xác th?c h? so gia su, có g?i ý t? OCR (AI ch? g?i ý, admin quy?t d?nh)
    public class ProfileVerification
    {// Khóa chính
        [Key]
        public int Id { get; set; }

        // K?t qu?: Approved ho?c Rejected
        public VerificationStatus Result { get; set; }

        // Lý do t? ch?i
        public string? Reason { get; set; }

        // K?t qu? g?i ý t? OCR, ch? d? tham kh?o
        public string? OcrSuggestion { get; set; }

        // Th?i di?m x? lý (UTC), null khi chua x? lý
        public DateTime? ProcessedAt { get; set; }

        // Khóa ngo?i t?i gia su du?c xác th?c
        [ForeignKey("Tutor")]
        public int TutorId { get; set; }
        public TutorProfile Tutor { get; set; } = null!;

        // Admin th?c hi?n xác th?c
        [ForeignKey("Admin")]
        public int? AdminId { get; set; }
        public AdminProfile? Admin { get; set; }


    }
}
