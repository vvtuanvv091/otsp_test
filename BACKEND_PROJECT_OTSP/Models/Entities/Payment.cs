using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Giao d?ch h?c phí qua c?ng thanh toán
    public class Payment
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // S? ti?n thanh toán (VNÐ)
        [Precision(18, 0)]
        public decimal Amount { get; set; }

        // Phuong th?c thanh toán
        [Required, MaxLength(50)]
        public string Method { get; set; } = "";

        // Tr?ng thái: Pending, Success, Failed
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        // Mã giao d?ch t? c?ng thanh toán, d?t unique d? tránh ghi nh?n trùng
        public string? GatewayTransactionCode { get; set; }

        // Th?i di?m thanh toán thành công (UTC), null khi chua thanh toán
        public DateTime? PaidAt { get; set; }

        // Khóa ngo?i t?i h?c viên tr? ti?n
        [ForeignKey("Student")]
        public int StudentId { get; set; }
        public StudentProfile Student { get; set; } = null!;

        // Khóa ngo?i t?i l?p h?c du?c thanh toán
        [ForeignKey("Classroom")]
        public int ClassroomId { get; set; }
        public Classroom Classroom { get; set; } = null!;

        // Hóa don tuong ?ng (1-1)
        public Invoice? Invoice { get; set; }

    }
}
