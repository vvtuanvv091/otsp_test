using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // M?t bu?i h?c c? th? trong l?p, có phòng video call và b?n ghi
    public class ClassSession
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Th?i di?m bu?i h?c (UTC)
        public DateTime ScheduledAt { get; set; }

        // Tr?ng thái: Scheduled, Done, Cancelled
        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

        // Link ho?c mã phòng video call
        public string? VideoRoom { get; set; }

        // Ðu?ng d?n b?n ghi bu?i h?c (ch? khi du?c phép ghi hình)
        public string? RecordingUrl { get; set; }

        // Khóa ngo?i t?i l?p h?c
        [ForeignKey("Classroom")]
        public int ClassroomId { get; set; }
        public Classroom Classroom { get; set; } = null!;

        // Các dánh giá c?a bu?i h?c (1-N)
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<ClassSessionAttendance> Attendances { get; set; } = new List<ClassSessionAttendance>();

    }
}
