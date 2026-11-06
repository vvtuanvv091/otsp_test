using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Báo cáo th?ng kê do admin l?p. S? li?u tính t? các b?ng khác, không luu k?t qu?.
    public class StatisticReport
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Lo?i th?ng kê: doanh thu, s? gia su/h?c viên, t? l? ghép n?i...
        [Required]
        public string ReportType { get; set; } = "";

        // T? ngày
        public DateOnly FromDate { get; set; }

        // Ð?n ngày
        public DateOnly ToDate { get; set; }

        // Khóa ngo?i t?i admin l?p báo cáo
        [ForeignKey("Admin")]
        public int AdminId { get; set; }
        public AdminProfile Admin { get; set; } = null!;

    }
}
