using BACKEND_PROJECT_OTSP.Dtos.Auth;
using BACKEND_PROJECT_OTSP.Models;

namespace BACKEND_PROJECT_OTSP.Services;

public interface IJwtService
{
    Task<AuthResponse> GenerateAuthResponseAsync(ApplicationUser user, bool rememberMe = false);
}
