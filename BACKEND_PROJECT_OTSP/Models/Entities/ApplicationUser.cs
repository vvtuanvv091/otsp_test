using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required, MaxLength(150)]
        public string FullName { get; set; } = "";
        [MaxLength(300)]
        public string? Address { get; set; }
        [MaxLength(12)]
        [RegularExpression("^[0-9]{12}$")]
        public string? CitizenIdNumber { get; set; }
        [MaxLength(500)]
        public string? ResidenceAddress { get; set; }

        // Ngày sinh, dùng d? tính tu?i (du?i 18 thì c?n ngu?i giám h?)
        public DateOnly? DateOfBirth { get; set; }

        // Ðu?ng d?n ?nh d?i di?n
        public string? AvatarUrl { get; set; }

        // Tr?ng thái tài kho?n: Active ho?c Locked
        public AccountStatus Status { get; set; } = AccountStatus.Active;

        // Th?i di?m t?o tài kho?n (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // H? so theo vai trò (1-1, m?i tài kho?n t?i da 1 h? so m?i lo?i)
        public StudentProfile? StudentProfile { get; set; }
        public TutorProfile? TutorProfile { get; set; }
        public AdminProfile? AdminProfile { get; set; }

        // Nh?t ký thao tác c?a tài kho?n (1-N)
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

        // Thông báo g?i d?n tài kho?n (1-N)
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        // Tin nh?n dã g?i và dã nh?n (1-N, 2 chi?u)
        public ICollection<Messager> SentMessagers { get; set; } = new List<Messager>();
        public ICollection<Messager> ReceivedMessagers { get; set; } = new List<Messager>();

        // Khi?u n?i dã g?i và khi?u n?i nh?m vào tài kho?n này (1-N, 2 chi?u)
        public ICollection<Complaint> SentComplaints { get; set; } = new List<Complaint>();
        public ICollection<Complaint> ReceivedComplaints { get; set; } = new List<Complaint>();
    }
}
