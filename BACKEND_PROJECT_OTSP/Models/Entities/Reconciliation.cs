using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Ð?i soát doanh thu gi?a n?n t?ng và gia su theo k?. Không t? chuy?n ti?n.
    public class Reconciliation
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // K? d?i soát, ví d?: 2026-10
        [Required]
        public string Period { get; set; } = "";

        // T?ng doanh thu c?a gia su trong k? (VNÐ)
        [Precision(18, 0)]
        public decimal TotalRevenue { get; set; }

        // Ngày l?p d?i soát
        public DateOnly CreatedDate { get; set; }

        // Khóa ngo?i t?i gia su
        [ForeignKey("Tutor")]
        public int TutorId { get; set; }
        public TutorProfile Tutor { get; set; } = null!;

        // Khóa ngo?i t?i admin l?p d?i soát
        [ForeignKey("Admin")]
        public int AdminId { get; set; }
        public AdminProfile Admin { get; set; } = null!;

    }
}
