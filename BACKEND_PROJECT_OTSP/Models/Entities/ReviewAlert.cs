using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    /// <summary>
    /// C?nh báo dánh giá b?t thu?ng do AI phát hi?n, admin xem xét.AI không t? xóa dánh giá.
    /// </summary>
    public class ReviewAlert
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Lý do b? c?nh báo
        [Required]
        public string Reason { get; set; } = "";

        // Tr?ng thái: New, Reviewed, Dismissed
        public AlertStatus Status { get; set; } = AlertStatus.New;

        // Th?i di?m t?o c?nh báo (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngo?i t?i dánh giá b? c?nh báo
        [ForeignKey("Review")]
        public int ReviewId { get; set; }
        public Review Review { get; set; } = null!;

        // Admin dã xem xét c?nh báo
        [ForeignKey("ReviewedByAdmin")]
        public int? ReviewedByAdminId { get; set; }
        public AdminProfile? ReviewedByAdmin { get; set; }

    }
}
