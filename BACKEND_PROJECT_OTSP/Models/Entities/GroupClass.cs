using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // L?p h?c nhóm do trung tâm t? ch?c, hi?n th? công khai
    public class GroupClass
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Tên l?p
        [Required]
        public string Name { get; set; } = "";

        // Môn-c?p c?a l?p, luu d?ng van b?n (d?t tên khác d? tránh trùng class SubjectLevel)
        public string SubjectLevelText { get; set; } = "";

        // L?ch h?c d?ng van b?n
        public string? Schedule { get; set; }
        // Môn và c?p c?a l?p nhóm, luu d?ng van b?n (trung tâm, s? thi?t k? sau)
        public string SubjectText { get; set; } = "";


        // Khóa ngo?i t?i trung tâm
        [ForeignKey("Center")]
        public int CenterId { get; set; }
        public PartnerCenter Center { get; set; } = null!;

    }
}
