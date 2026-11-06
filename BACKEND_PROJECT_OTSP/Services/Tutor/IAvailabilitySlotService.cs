using BACKEND_PROJECT_OTSP.Dtos;

namespace BACKEND_PROJECT_OTSP.Services;

public interface IAvailabilitySlotService
{
    Task<List<TutorAvailableSlotDto>> GetAvailableSlotsAsync(
        int tutorId,
        int daysAhead = 14,
        CancellationToken cancellationToken = default);

    Task<List<TutorAvailableSlotDto>> GetAvailableSlotsForStudentAsync(
        int tutorId,
        int studentId,
        int daysAhead = 14,
        CancellationToken cancellationToken = default);
}
