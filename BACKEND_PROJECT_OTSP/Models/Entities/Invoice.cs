using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND_PROJECT_OTSP.Models
{
    // Hóa don, ch? t?o m?t l?n khi thanh toán thành công
    public class Invoice
    {
        // Khóa chính
        [Key]
        public int Id { get; set; }

        // Ngày xu?t hóa don
        public DateOnly IssuedDate { get; set; }

        // T?ng ti?n trên hóa don (VNÐ)
        [Precision(18, 0)]
        public decimal TotalAmount { get; set; }

        // Khóa ngo?i t?i giao d?ch (1-1, d?t unique trong DbContext)
        [ForeignKey("Payment")]
        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;

    }
}
