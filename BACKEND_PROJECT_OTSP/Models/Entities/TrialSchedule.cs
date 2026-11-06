using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // L?ch h?c th? d?t trên m?t yêu c?u k?t n?i. Gia su xác nh?n ho?c t? ch?i.
    public class TrialSchedule
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Th?i di?m h?c th? (UTC)
        public DateTime ScheduledAt { get; set; }

        // Tr?ng thái: Pending, Confirmed, Rejected
        public ScheduleStatus Status { get; set; } = ScheduleStatus.Pending;

        // Khóa ngo?i t?i yêu c?u k?t n?i
        [ForeignKey("ConnectionRequest")]
        public int ConnectionRequestId { get; set; }
        public ConnectionRequest ConnectionRequest { get; set; } = null!;

        public int? ClassSessionId { get; set; }
        public ClassSession? ClassSession { get; set; }

    }
}
