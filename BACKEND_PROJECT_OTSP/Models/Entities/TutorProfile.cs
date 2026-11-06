using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // H? so gia su
    public class TutorProfile
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Gi?i thi?u b?n thân, kinh nghi?m gi?ng d?y
        public string? Introduction { get; set; }

        // H?c phí m?i gi? (VNÐ), ki?u s? nguyên không có ph?n th?p phân
        [Precision(18, 0)]
        public decimal HourlyFee { get; set; }

        public Enums.TeachingFormat TeachingFormat { get; set; } = Enums.TeachingFormat.Hybrid;

        // Tr?ng thái xác th?c h? so: Pending, Approved, Rejected
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

        // Ði?m dánh giá trung bình (tính t? Review)
        public double AverageRating { get; set; }

        // Khóa ngo?i t?i tài kho?n (1-1)
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = "";
        public ApplicationUser User { get; set; } = null!;

        // B?ng c?p, ch?ng ch? t?i lên (1-N)
        public ICollection<Qualification> Qualifications { get; set; } = new List<Qualification>();

        // Các l?n admin xác th?c h? so (1-N)
        public ICollection<ProfileVerification> ProfileVerifications { get; set; } = new List<ProfileVerification>();

        // Yêu c?u k?t n?i g?i t?i gia su (1-N)
        public ICollection<ConnectionRequest> ConnectionRequests { get; set; } = new List<ConnectionRequest>();

        // L?p h?c gia su dang d?y (1-N)
        public ICollection<Classroom> Classrooms { get; set; } = new List<Classroom>();

        // Tài li?u gia su dã t?i lên (1-N)
        public ICollection<LearningDocument> LearningDocuments { get; set; } = new List<LearningDocument>();

        // Ð?i soát doanh thu theo k? (1-N)
        public ICollection<Reconciliation> Reconciliations { get; set; } = new List<Reconciliation>();

        // Môn và c?p gia su d?y (1-N qua b?ng TutorSubject)
        public ICollection<TutorSubject> TutorSubjects { get; set; } = new List<TutorSubject>();

        // Các khung gi? gia su có th? d?y, l?p l?i hàng tu?n (1-N)
        public ICollection<TutorAvailability> Availabilities { get; set; } = new List<TutorAvailability>();

    }
}
