using Microsoft.AspNetCore.Identity;
namespace BACKEND_PROJECT_OTSP.Models 
{
    public class ApplicationRole : IdentityRole
    {
    public string? Description { get; set; }
}
}
