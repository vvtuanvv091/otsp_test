using System.ComponentModel.DataAnnotations;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Danh m?c môn h?c: Toán, Ti?ng Anh... M?i môn m?t dòng.
    public class Subject
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Mã môn, ví d?: TOAN, TIENGANH
        [Required, MaxLength(20)]
        public string Code { get; set; } = "";

        // Tên môn, ví d?: Toán
        [Required, MaxLength(100)]
        public string Name { get; set; } = "";

        [MaxLength(1000)]
        public string? Description { get; set; }


        // Gia su d?y môn này ? các c?p (1-N)
        public ICollection<TutorSubject> TutorSubjects { get; set; } = new List<TutorSubject>();

        // Yêu c?u k?t n?i xin h?c môn này (1-N)
        public ICollection<ConnectionRequest> ConnectionRequests { get; set; } = new List<ConnectionRequest>();

        // Tài li?u thu?c môn này (1-N)
        public ICollection<LearningDocument> LearningDocuments { get; set; } = new List<LearningDocument>();

        // L?p h?c d?y môn này (1-N)
        public ICollection<Classroom> Classrooms { get; set; } = new List<Classroom>();

    }
}
