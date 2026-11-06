using System.ComponentModel.DataAnnotations;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Danh m?c c?p h?c: Ti?u h?c, THCS, THPT. M?i c?p m?t dòng.
    public class GradeLevel
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Mã c?p h?c, ví d?: THCS
        [Required, MaxLength(20)]
        public string Code { get; set; } = "";

        // Tên c?p h?c, ví d?: Trung h?c co s?
        [Required, MaxLength(100)]
        public string Name { get; set; } = "";

        // Gia su d?y c?p này (1-N)
        public ICollection<TutorSubject> TutorSubjects { get; set; } = new List<TutorSubject>();

        // Yêu c?u k?t n?i xin h?c c?p này (1-N)
        public ICollection<ConnectionRequest> ConnectionRequests { get; set; } = new List<ConnectionRequest>();

        // Tài li?u thu?c c?p này (1-N)
        public ICollection<LearningDocument> LearningDocuments { get; set; } = new List<LearningDocument>();

        // L?p h?c thu?c c?p này (1-N)
        public ICollection<Classroom> Classrooms { get; set; } = new List<Classroom>();

    }
}
