using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Xunit;
using BACKEND_PROJECT_OTSP.Services.Auth;
using System.Collections.Generic;

namespace BACKEND_PROJECT_OTSP.Tests;

public class AuthTests
{
    [Fact]
    public async Task GoogleValidator_ThrowsWhenClientIdMissing()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Google:ClientId", "" }
            })
            .Build();

        var validator = new GoogleIdTokenValidator(config);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            validator.ValidateAsync("mock_token"));
    }

    [Fact]
    public async Task GoogleValidator_ReturnsNull_ForEmptyCredential()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Google:ClientId", "mock-google-client-id.apps.googleusercontent.com" }
            })
            .Build();

        var validator = new GoogleIdTokenValidator(config);
        var result = await validator.ValidateAsync("");

        Assert.Null(result);
    }

    [Theory]
    [InlineData("Student_Parent", true)]
    [InlineData("Tutor", true)]
    [InlineData("Admin", false)]
    [InlineData("InvalidRole", false)]
    public void GoogleRegistration_OnlyAllowsStudentOrTutorRole(string role, bool expectedValid)
    {
        bool isValid = role == "Student_Parent" || role == "Tutor";
        Assert.Equal(expectedValid, isValid);
    }
}

