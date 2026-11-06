using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Trung tâm d?y h?c liên k?t v?i n?n t?ng, do admin qu?n lý
    public class PartnerCenter
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Tên trung tâm
        [Required]
        public string Name { get; set; } = "";

        // Ð?a ch?
        public string? Address { get; set; }

        // Thông tin liên h?
        public string? ContactInfo { get; set; }

        // Tr?ng thái: Active ho?c Inactive
        public string Status { get; set; } = "Active";

        // Khóa ngo?i t?i admin qu?n lý
        [ForeignKey("Admin")]
        public int AdminId { get; set; }
        public AdminProfile Admin { get; set; } = null!;

        // Các l?p nhóm trung tâm t? ch?c (1-N)
        public ICollection<GroupClass> GroupClasses { get; set; } = new List<GroupClass>();

    }
}
