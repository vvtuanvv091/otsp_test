using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Dtos.Auth;

/// <summary>
/// DTO chứa thông tin đăng ký tài khoản (Học viên / Phụ huynh hoặc Gia sư).
/// </summary>
public class RegisterRequest
{
    public string Role { get; set; } = "Student_Parent"; // "Student_Parent" | "Tutor"
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? ConfirmPassword { get; set; }
    public string? PhoneNumber { get; set; }
    public string? DateOfBirth { get; set; } // yyyy-MM-dd
    public string? CitizenIdNumber { get; set; } // 12 số CCCD
    public string? ResidenceAddress { get; set; } // Nơi ở hiện tại
    public bool AcceptTerms { get; set; }

    // Dành riêng cho học viên / người giám hộ
    public string? InterestedSubjects { get; set; }
    public string? Area { get; set; }
    public string? GuardianFullName { get; set; }
    public string? GuardianContact { get; set; }
    public string? GuardianCitizenIdNumber { get; set; }
    public string? GuardianResidenceAddress { get; set; }

    // Dành riêng cho gia sư
    public decimal? HourlyFee { get; set; }
    public TeachingFormat? TeachingFormat { get; set; }
    public string? Introduction { get; set; }
}
