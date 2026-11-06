using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // M?t lu?t h?c viên h?i AI d? ôn t?p và nh?n g?i ý
    public class AiStudySession
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Câu h?i c?a h?c viên
        [Required]
        public string Question { get; set; } = "";

        // N?i dung AI tr? v?
        public string? Suggestion { get; set; }

        // Th?i di?m h?i (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngo?i t?i h?c viên
        [ForeignKey("Student")]
        public int StudentId { get; set; }
        public StudentProfile Student { get; set; } = null!;

    }
}
