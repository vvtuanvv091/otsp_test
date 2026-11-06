using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // H? so qu?n tr? viên.
    public class AdminProfile
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // C?p b?c qu?n tr?
        public string? Rank { get; set; }

        // Khóa ngo?i t?i tài kho?n (1-1)
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = "";
        public ApplicationUser User { get; set; } = null!;

        // Các l?n xác th?c h? so gia su dã x? lý (1-N)
        public ICollection<ProfileVerification> ProfileVerifications { get; set; } = new List<ProfileVerification>();

        // Khi?u n?i dã x? lý (1-N)
        public ICollection<Complaint> HandledComplaints { get; set; } = new List<Complaint>();

        // Tin t?c dã dang (1-N)
        public ICollection<NewsArticle> NewsArticles { get; set; } = new List<NewsArticle>();

        // Trung tâm liên k?t dã qu?n lý (1-N)
        public ICollection<PartnerCenter> PartnerCenters { get; set; } = new List<PartnerCenter>();

        // Ð?i soát dã l?p (1-N)
        public ICollection<Reconciliation> Reconciliations { get; set; } = new List<Reconciliation>();

        // C?nh báo dánh giá b?t thu?ng dã xem xét (1-N)
        public ICollection<ReviewAlert> ReviewedAlerts { get; set; } = new List<ReviewAlert>();

        // Báo cáo th?ng kê dã l?p (1-N)
        public ICollection<StatisticReport> StatisticReports { get; set; } = new List<StatisticReport>();

    }
}
