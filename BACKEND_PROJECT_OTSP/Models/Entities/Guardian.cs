using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Ngu?i giám h? (ph? huynh) c?a h?c viên du?i 18 tu?i.
    // Ch? luu thông tin liên h?, không ph?i tài kho?n dang nh?p.
    public class Guardian
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // H? tên ngu?i giám h?
        [Required, MaxLength(150)]
        public string FullName { get; set; } = "";

        // S? di?n tho?i ho?c email d? liên h?
        [Required, MaxLength(100)]
        public string ContactInfo { get; set; } = "";

        [MaxLength(12)]
        [RegularExpression("^[0-9]{12}$")]
        public string? CitizenIdNumber { get; set; }

        [MaxLength(500)]
        public string? ResidenceAddress { get; set; }

        // Th?i di?m thêm vào h? so (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngo?i t?i h? so h?c viên
        [ForeignKey("StudentProfile")]
        public int StudentProfileId { get; set; }
        public StudentProfile StudentProfile { get; set; } = null!;

    }
}
