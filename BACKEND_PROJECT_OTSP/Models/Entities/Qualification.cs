using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // B?ng c?p, ch?ng ch? gia su t?i lên d? du?c xác th?c
    public class Qualification
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Tên b?ng c?p/ch?ng ch?
        [Required, MaxLength(200)]
        public string Title { get; set; } = "";

        // Ðu?ng d?n file (ví d? trên S3/Storage)
        public string? FileUrl { get; set; }

        // Tr?ng thái: Pending, Approved, Rejected
        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

        // Khóa ngo?i t?i gia su
        [ForeignKey("Tutor")]
        public int TutorId { get; set; }
        public TutorProfile Tutor { get; set; } = null!;

    }
}
