using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // B?ng trung gian N-N gi?a l?p h?c và h?c viên.
    // Khóa chính ghép (ClassroomId, StudentId) khai báo trong DbContext.

    public class ClassroomStudent
    {
        // Khóa ngo?i t?i l?p h?c
        [ForeignKey("Classroom")]
        public int ClassroomId { get; set; }
        public Classroom Classroom { get; set; } = null!;

        // Khóa ngo?i t?i h?c viên
        [ForeignKey("Student")]
        public int StudentId { get; set; }
        public StudentProfile Student { get; set; } = null!;

        // Th?i di?m h?c viên vào l?p (UTC)
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    }
}
