using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Ði?m và nh?n xét c?a h?c viên/ph? huynh v? m?t bu?i h?c
    public class Review
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Ði?m dánh giá t? 1 d?n 5
        [Range(1, 5)]
        public int Score { get; set; }

        // Nh?n xét b?ng van b?n
        [MaxLength(1000)]
        public string? Comment { get; set; }

        // Th?i di?m dánh giá (UTC)
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngo?i t?i bu?i h?c du?c dánh giá
        [ForeignKey("ClassSession")]
        public int ClassSessionId { get; set; }
        public ClassSession ClassSession { get; set; } = null!;

        // Khóa ngo?i t?i h?c viên dánh giá
        [ForeignKey("Student")]
        public int StudentId { get; set; }
        public StudentProfile Student { get; set; } = null!;

        // Các c?nh báo b?t thu?ng do AI t?o cho dánh giá này (1-N)
        public ICollection<ReviewAlert> ReviewAlerts { get; set; } = new List<ReviewAlert>();

    }
}
