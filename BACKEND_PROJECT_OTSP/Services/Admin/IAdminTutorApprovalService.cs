using BACKEND_PROJECT_OTSP.Dtos.Admin;
using BACKEND_PROJECT_OTSP.Dtos.Common;

namespace BACKEND_PROJECT_OTSP.Services.Admin;

public interface IAdminTutorApprovalService
{
    Task<List<TutorApprovalViewModel>> GetPendingTutorsAsync(CancellationToken cancellationToken = default);
    Task<AdminTutorApprovalDashboardDto> GetPendingTutorDashboardAsync(AdminTutorApprovalQuery query, CancellationToken cancellationToken = default);
    Task<List<AdminPendingQualificationItemDto>> GetAllPendingQualificationsAsync(CancellationToken cancellationToken = default);
    Task<(string? FilePath, string? ContentType, string? ErrorMessage)> GetQualificationFileAsync(int qualificationId, CancellationToken cancellationToken = default);
    Task<(bool Success, string Message, string? ErrorMessage)> ApproveTutorAsync(int tutorId, string adminUserId, string? ipAddress, CancellationToken cancellationToken = default);
    Task<(bool Success, string Message, string? ErrorMessage)> RejectTutorAsync(int tutorId, string adminUserId, string reason, string? ipAddress, CancellationToken cancellationToken = default);
    Task<(bool Success, string? ErrorMessage)> ReviewQualificationAsync(int qualificationId, string adminUserId, bool approved, string? reason, string? ipAddress, CancellationToken cancellationToken = default);
    Task<VerifyCertificateResponseDto?> VerifyQualificationWithAiAsync(int qualificationId, CancellationToken cancellationToken = default);
}

