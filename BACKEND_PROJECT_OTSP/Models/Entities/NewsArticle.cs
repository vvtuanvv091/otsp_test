using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Bài tin t?c giáo d?c do admin dang, hi?n th? theo chuyên m?c
    public class NewsArticle
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Tiêu d? bài vi?t
        [Required, MaxLength(250)]
        public string Title { get; set; } = "";

        // N?i dung bài vi?t
        [Required]
        public string Content { get; set; } = "";

        // Chuyên m?c
        [Required]
        public string Category { get; set; } = "";

        // Th?i di?m dang (UTC)
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngo?i t?i admin dang bài
        [ForeignKey("Admin")]
        public int AdminId { get; set; }
        public AdminProfile Admin { get; set; } = null!;

    }
}
