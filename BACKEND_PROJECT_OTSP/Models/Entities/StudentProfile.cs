using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // H? so h?c viên/ph? huynh. M?i tài kho?n có t?i da 1 h? so này.
    // Khi h?c viên du?i 18 tu?i thì c?n thêm ngu?i giám h? (b?ng Guardian).

    public class StudentProfile
    {
        // Khóa chính, t? tang
        [Key]
        public int Id { get; set; }

        // Môn h?c quan tâm, luu d?ng van b?n t? do (ví d?: "Toán, Ti?ng Anh")
        public string? InterestedSubjects { get; set; }

        // Khu v?c h?c mong mu?n
        [MaxLength(200)]
        public string? Area { get; set; }

        // L?ch r?nh, luu d?ng van b?n mô t? (ví d?: "Th? 3, Th? 5 bu?i t?i")
        public string? FreeSchedule { get; set; }

        // Khóa ngo?i tr? t?i tài kho?n (ApplicationUser.Id), d?t unique trong DbContext (1-1)
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = "";

        // Thu?c tính di?u hu?ng t?i tài kho?n
        public ApplicationUser User { get; set; } = null!;

        // Ngu?i giám h? (1-N), ch? có khi h?c viên du?i 18 tu?i
        public ICollection<Guardian> Guardians { get; set; } = new List<Guardian>();

        // Yêu c?u k?t n?i h?c viên dã g?i t?i gia su (1-N)
        public ICollection<ConnectionRequest> ConnectionRequests { get; set; } = new List<ConnectionRequest>();

        // Các lu?t h?c viên h?i AI d? ôn t?p (1-N)
        public ICollection<AiStudySession> AiStudySessions { get; set; } = new List<AiStudySession>();

        // Các giao d?ch thanh toán h?c phí (1-N)
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        // Các dánh giá h?c viên dã vi?t cho gia su (1-N)
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        // Các l?p h?c viên dang tham gia (N-N qua b?ng ClassroomStudent)
        public ICollection<ClassroomStudent> ClassroomStudents { get; set; } = new List<ClassroomStudent>();

    }
}
